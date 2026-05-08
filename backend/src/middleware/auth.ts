import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import 'dotenv/config';
import { UnauthorizedError } from '../lib/errors.js';

const JWT_SECRET = process.env.JWT_SECRET!;
const CSRF_SECRET = process.env.CSRF_SECRET ?? crypto.randomBytes(32).toString('hex');

export interface JwtPayload {
  id: string;
  email: string;
  type: 'access' | 'refresh';
  csrf?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF middleware - validates double-submit cookie pattern
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip for safe methods
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }

  // Get CSRF token from header
  const csrfHeader = req.headers['x-csrf-token'] as string;
  const csrfCookie = req.cookies?.['csrf-token'] as string;

  // If either is missing, reject
  if (!csrfHeader || !csrfCookie) {
    res.status(403).json({ error: 'CSRF token requerido' });
    return;
  }

  // Validate they match (constant-time comparison)
  if (!crypto.timingSafeEqual(Buffer.from(csrfHeader), Buffer.from(csrfCookie))) {
    res.status(403).json({ error: 'CSRF token inválido' });
    return;
  }

  next();
}

// Extract token from cookie or header
function extractToken(req: Request): string | null {
  // Try cookie first
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // Fall back to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'No autorizado. Inicia sesión.' });
    return;
  }

  if (!JWT_SECRET) {
    res.status(500).json({ error: 'JWT_SECRET is not configured' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (payload.type !== 'access') {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    req.user = payload;
    next();
  } catch {
    // Token expired - try to refresh
    if (req.cookies?.refreshToken) {
      // Let the client know they need to refresh
      res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Generate new token pair (for testing or initial login)
export function generateTokens(payload: { id: string; email: string }): { accessToken: string; refreshToken: string; csrfToken: string } {
  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');
  const csrfToken = generateCsrfToken();

  return { accessToken, refreshToken, csrfToken };
}

// Verify and optionally revoke refresh token
export function verifyRefreshToken(token: string): boolean {
  try {
    // This will be implemented in auth.service.ts
    return true;
  } catch {
    return false;
  }
}

// Revoke all tokens for user
export async function revokeAllTokens(userId: string): Promise<void> {
  const { revokeAllUserTokens } = await import('../modules/auth/auth.service.js');
  await revokeAllUserTokens(userId);
}
