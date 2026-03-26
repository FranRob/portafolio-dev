import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';
import 'dotenv/config';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin) {
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  const payload = { id: admin.id, email: admin.email };
  const token = jwt.sign(payload, secret, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: admin.id,
      email: admin.email,
      createdAt: admin.createdAt,
    },
  };
}
