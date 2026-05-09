import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../lib/prisma.js';
import { UnauthorizedError } from '../../lib/errors.js';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? JWT_SECRET + '_refresh';

export interface TokenPayload {
  id: string;
  email: string;
  type: 'access' | 'refresh';
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  ip: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: Date;
  adminId: string | null;
}

export async function login(email: string, password: string, ip?: string, userAgent?: string): Promise<LoginResult | null> {
  if (!JWT_SECRET) {
    throw new UnauthorizedError('JWT_SECRET no está configurado');
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatch) {
    // Log failed attempt
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_FAILED',
        ip: ip || null,
        userAgent: userAgent || null,
        details: `Invalid password for ${email}`,
      },
    });
    return null;
  }

  // Generate tokens
  const accessToken = jwt.sign(
    { id: admin.id, email: admin.email, type: 'access' },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');

  // Save refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Update last login
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      lastLoginAt: new Date(),
      failedAttempts: 0, // Reset failed attempts on successful login
      lockedUntil: null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'LOGIN_SUCCESS',
      ip: ip || null,
      userAgent: userAgent || null,
      details: 'Successful login',
      adminId: admin.id,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: admin.id,
      email: admin.email,
      createdAt: admin.createdAt,
    },
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!tokenRecord) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (tokenRecord.revokedAt) {
    throw new UnauthorizedError('Token revoked');
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired');
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: tokenRecord.adminId },
  });

  if (!admin) {
    throw new UnauthorizedError('User not found');
  }

  const accessToken = jwt.sign(
    { id: admin.id, email: admin.email, type: 'access' },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: 'TOKEN_REFRESH',
      adminId: admin.id,
      details: 'Access token refreshed',
    },
  });

  return { accessToken };
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { adminId: userId },
    data: { revokedAt: new Date() },
  });
}

export async function getAuditLogs(userId?: string, limit = 50): Promise<AuditLogEntry[]> {
  return prisma.auditLog.findMany({
    where: userId ? { adminId: userId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  }) as Promise<AuditLogEntry[]>;
}

export async function unlockAccount(userId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ACCOUNT_UNLOCKED',
      adminId: userId,
      details: 'Account manually unlocked',
    },
  });
}

// Change password
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const admin = await prisma.adminUser.findFirst({
    where: { id: userId },
  });

  if (!admin) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  const passwordMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Contraseña actual incorrecta');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // Log the change
  await prisma.auditLog.create({
    data: {
      action: 'PASSWORD_CHANGED',
      adminId: userId,
      details: 'Password changed by user',
    },
  });
}
