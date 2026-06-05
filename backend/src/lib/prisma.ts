import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;

/**
 * Factory for standalone CLI scripts (seed, migrations) that need their own
 * connection lifecycle. Call pool.end() after prisma.$disconnect().
 */
export function createPrismaClient(url?: string): { prisma: PrismaClient; pool: pg.Pool } {
  const connectionString = url ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return { prisma: new PrismaClient({ adapter }), pool };
}
