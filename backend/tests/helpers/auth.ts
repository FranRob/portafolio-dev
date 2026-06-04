import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import supertest from 'supertest';

/**
 * Parse Set-Cookie header array into a record of cookie name → value.
 */
export function parseCookies(setCookieHeader: string[] | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!setCookieHeader) return result;
  for (const cookie of setCookieHeader) {
    const [cookiePair] = cookie.split(';');
    const [name, ...rest] = cookiePair.split('=');
    if (name) {
      result[name.trim()] = rest.join('=');
    }
  }
  return result;
}

/**
 * Upsert admin user with bcrypt-hashed password from env vars.
 * Idempotent — safe to call multiple times.
 */
export async function seedAdmin(prisma: PrismaClient): Promise<{ id: string; email: string }> {
  const email = process.env['ADMIN_EMAIL'] ?? 'admin@example.com';
  const password = process.env['ADMIN_PASSWORD'] ?? 'testpassword';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });

  return { id: admin.id, email: admin.email };
}

/**
 * Login as admin via POST /api/auth/login, returning tokens and cookies.
 * Makes a REAL HTTP request through the Express app (not mocked).
 */
export async function getValidToken(app: Express) {
  const request = supertest(app);
  const email = process.env['ADMIN_EMAIL'] ?? 'admin@example.com';
  const password = process.env['ADMIN_PASSWORD'] ?? 'testpassword';

  const res = await request.post('/api/auth/login').send({ email, password }).expect(200);

  const cookies = parseCookies(res.headers['set-cookie']);

  return {
    accessToken: res.body.accessToken as string,
    csrfToken: cookies['csrf-token'] ?? '',
    refreshToken: cookies['refreshToken'] ?? '',
    cookies,
    user: res.body.user,
  };
}

/**
 * Build auth headers for supertest from csrfToken and accessToken.
 * Returns headers ready to pass to `.set()`:
 * - Cookie with csrf-token and accessToken
 * - x-csrf-token header for CSRF double-submit pattern
 */
export function getAuthHeaders(csrfToken: string, accessToken: string): Record<string, string> {
  return {
    Cookie: `csrf-token=${csrfToken}; accessToken=${accessToken}`,
    'x-csrf-token': csrfToken,
  };
}

/**
 * Convenience: login as admin and return auth headers in one call.
 * Combines getValidToken + getAuthHeaders.
 */
export async function getCsrfConfig(app: Express) {
  const tokens = await getValidToken(app);
  const headers = getAuthHeaders(tokens.csrfToken, tokens.accessToken);
  return { headers, tokens };
}
