import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import prisma from '../../lib/prisma.js';
import { UnauthorizedError } from '../../lib/errors.js';

// Generate a new 2FA secret for a user
export async function generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
  const secret = authenticator.generateSecret();
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  // Generate provisioning URI for authenticator app
  const otpUri = authenticator.keyuri(user.email, 'portafolio-dev', secret);

  // Generate QR code as data URL
  const qrCode = await QRCode.toDataURL(otpUri);

  return { secret, qrCode };
}

// Enable 2FA for a user after verifying the code
export async function enableTwoFactor(userId: string, code: string, secret: string): Promise<void> {
  // Verify the code
  const isValid = authenticator.verify({ token: code, secret });

  if (!isValid) {
    throw new UnauthorizedError('Código 2FA inválido');
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
    },
  });
}

// Disable 2FA for a user
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
}

// Verify 2FA code
export async function verifyTwoFactor(userId: string, code: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return false;
  }

  return authenticator.verify({ token: code, secret: user.twoFactorSecret });
}

// Check if user has 2FA enabled (for login flow)
export async function hasTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  return user?.twoFactorEnabled ?? false;
}