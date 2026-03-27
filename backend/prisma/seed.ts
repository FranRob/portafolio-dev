import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
    },
  });

  console.log(`Admin user seeded: ${admin.email} (id: ${admin.id})`);

  // Seed projects
  const projectsToSeed = [
    {
      id: 'proj-constructora-001',
      title: 'Constructora Web',
      description:
        'Landing page y dashboard de gestión para empresa constructora. Panel de control con seguimiento de obras, clientes y presupuestos.',
      stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      status: 'in_progress' as const,
      category: 'freelance' as const,
      featured: true,
      order: 1,
      repoUrl: null,
      demoUrl: null,
      imageUrl: null,
    },
    {
      id: 'proj-pasteleria-002',
      title: 'Pastelería Online',
      description:
        'Plataforma completa para pastelería artesanal. Landing page, gestión de stock e inventario, y administración de clientes.',
      stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      status: 'in_progress' as const,
      category: 'freelance' as const,
      featured: true,
      order: 2,
      repoUrl: null,
      demoUrl: null,
      imageUrl: null,
    },
    {
      id: 'proj-barber-saas-003',
      title: 'Barber SaaS',
      description:
        'SaaS multi-tenant para barberías. Gestión de servicios, barberos, horarios y turnos. Desarrollado junto a mi compañera de trabajo.',
      stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Docker'],
      status: 'in_progress' as const,
      category: 'collaborative' as const,
      featured: true,
      order: 3,
      repoUrl: null,
      demoUrl: null,
      imageUrl: null,
    },
  ];

  for (const proj of projectsToSeed) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {},
      create: proj,
    });
    console.log(`Project seeded: ${proj.title}`);
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
