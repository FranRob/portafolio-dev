import { authenticator } from 'otplib';
import crypto from 'crypto';
import QRCode from 'qrcode';
import prisma from '../../lib/prisma.js';
import { UnauthorizedError } from '../../lib/errors.js';
import 'dotenv/config';

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

  // Encrypt and save the secret
  const encryptedSecret = encryptSecret(secret);

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: encryptedSecret,
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

  const secret = decryptSecret(user.twoFactorSecret);
  return authenticator.verify({ token: code, secret });
}

// Check if user has 2FA enabled (for login flow)
export async function hasTwoFactorEnabled(userId: string): Promise<boolean> {
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  return user?.twoFactorEnabled ?? false;
}

// Helper to encrypt the secret before storing
function encryptSecret(secret: string): string {
  const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Helper to decrypt the secret when verifying
function decryptSecret(encryptedSecret: string): string {
  const key = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const [ivHex, encrypted] = encryptedSecret.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}