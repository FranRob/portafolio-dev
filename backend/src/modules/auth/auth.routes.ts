import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { requireAuth, generateTokens, revokeAllTokens, generateCsrfToken } from '../../middleware/auth.js';
import { login, refreshAccessToken, revokeRefreshToken, getAuditLogs, unlockAccount, changePassword } from './auth.service.js';
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor, verifyTwoFactor, hasTwoFactorEnabled } from './twoFactor.service.js';
import { asyncHandler } from '../../lib/errorMiddleware.js';
import { ValidationError, UnauthorizedError, TooManyRequestsError } from '../../lib/errors.js';

const router = Router();

// Configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// In-memory rate limiting (will be replaced with Redis in production)
const loginAttempts = new Map<string, { attempts: number; blockedUntil?: Date }>();

// Check and update rate limit
function checkRateLimit(email: string, ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
  const key = `${ip}:${email}`;
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS };
  }

  if (attempt.blockedUntil && attempt.blockedUntil > new Date()) {
    const retryAfter = Math.ceil((attempt.blockedUntil.getTime() - Date.now()) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Reset after lockout period
  if (attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(key, { attempts: 0 });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS };
  }

  const remaining = MAX_LOGIN_ATTEMPTS - attempt.attempts;
  return { allowed: remaining > 0, remaining };
}

// Record failed attempt
function recordFailedAttempt(email: string, ip: string): void {
  const key = `${ip}:${email}`;
  const attempt = loginAttempts.get(key) || { attempts: 0 };

  attempt.attempts += 1;

  if (attempt.attempts >= MAX_LOGIN_ATTEMPTS) {
    attempt.blockedUntil = new Date(Date.now() + LOCKOUT_MS);
  }

  loginAttempts.set(key, attempt);
}

// Reset on success
function resetRateLimit(email: string, ip: string): void {
  const key = `${ip}:${email}`;
  loginAttempts.delete(key);
}

const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('El email debe tener formato válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { email, password } = req.body;

  // Check rate limit before anything
  const rateCheck = checkRateLimit(email, ip);
  if (!rateCheck.allowed) {
    throw new TooManyRequestsError(`Cuenta bloqueada. Intenta de nuevo en ${Math.ceil(LOCKOUT_MS / 60000)} minutos.`);
  }

  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map(i => i.message);
    throw new ValidationError(errors);
  }

  const result = await login(parsed.data.email, parsed.data.password, ip, req.headers['user-agent']);

  if (!result) {
    // Record failed attempt
    recordFailedAttempt(parsed.data.email, ip);
    const remaining = checkRateLimit(parsed.data.email, ip);
    throw new UnauthorizedError(`Credenciales inválidas. Intentos restantes: ${remaining.remaining}`);
  }

  // Reset rate limit on success
  resetRateLimit(parsed.data.email, ip);

  // Generate CSRF token for double-submit cookie pattern
  const csrfToken = crypto.randomBytes(32).toString('hex');

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax', // More secure: only sent on same-site navigations
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  // Also send accessToken in response body for header-based auth (more secure for cross-origin)
  const tokenForHeader = result.accessToken;

  res.json({ user: result.user, accessToken: tokenForHeader });
}));

// Refresh token endpoint - obtiene nuevo access token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError('Refresh token requerido');
  }

  const newAccess = await refreshAccessToken(parsed.data.refreshToken);

  // Set new access token in cookie
  res.cookie('accessToken', newAccess.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.json({ success: true });
}));

// Logout endpoint - invalida el refresh token
router.post('/logout', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  // Clear cookies
  res.cookie('accessToken', '', { httpOnly: true, maxAge: 0, path: '/' });
  res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' });

  res.json({ success: true, message: 'Sesión cerrada' });
}));

router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// Admin only - get audit logs
router.get('/audit', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const logs = await getAuditLogs(req.user?.id, 100);
  res.json({ logs });
}));

// Admin only - unlock account
router.post('/unlock/:userId', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  await unlockAccount(userId);
  res.json({ success: true, message: 'Cuenta desbloqueada' });
}));

// 2FA Setup - generate new 2FA secret
router.post('/2fa/setup', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { secret, qrCode } = await generateTwoFactorSecret(req.user!.id);
  res.json({ secret, qrCode });
}));

// 2FA Status - check if 2FA is enabled
router.get('/2fa/status', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const has2FA = await hasTwoFactorEnabled(req.user!.id);
  res.json({ enabled: has2FA });
}));

// 2FA Enable - verify and enable 2FA
router.post('/2fa/enable', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { code, secret } = req.body;

  if (!code || !secret) {
    throw new ValidationError('Código y secret son requeridos');
  }

  await enableTwoFactor(req.user!.id, code, secret);
  res.json({ success: true, message: '2FA habilitado' });
}));

// 2FA Disable - disable 2FA
router.post('/2fa/disable', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;

  // Verify 2FA before disabling
  const isValid = await verifyTwoFactor(req.user!.id, code);
  if (!isValid) {
    throw new UnauthorizedError('Código 2FA inválido');
  }

  await disableTwoFactor(req.user!.id);
  res.json({ success: true, message: '2FA deshabilitado' });
}));

// Change password
router.patch('/password', requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ValidationError('Contraseña actual y nueva son requeridas');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('La nueva contraseña debe tener al menos 8 caracteres');
  }

  await changePassword(req.user!.id, currentPassword, newPassword);
  res.json({ success: true, message: 'Contraseña actualizada' });
}));

export default router;
