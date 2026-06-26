import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { createPrismaClient } from '../src/lib/prisma.js';

const { prisma } = createPrismaClient();

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
  const barberSaasContent = `> **131 tests de integración** sobre PostgreSQL y Redis reales vía Testcontainers. Strict TDD aplicado en el 100% del backend.

### Implementaciones destacadas

- **Multi-tenancy estricta** — cada barbería tiene datos completamente aislados vía \`tenantId\` en cada query de Prisma; cascade delete en Tenant elimina toda la cadena
- **Auth enterprise-grade** — JWT 15min + refresh tokens rotativos 7d + blacklist en Redis para revocación inmediata; 2FA TOTP con dispositivos de confianza (30 días)
- **Pagos con MercadoPago** — OAuth 2.0 (authorize → callback → token encriptado con rotación proactiva); Checkout Pro para cobrar depósitos al momento de reservar
- **Notificaciones automáticas** — WhatsApp (Meta Cloud API) + email (Resend); cron cada 15 minutos; recordatorios a 1h y 15min antes del turno; retry con backoff exponencial
- **Booking público sin cuenta** — clientes reservan con nombre + teléfono; seguimiento de estado del turno vía token público
- **Prevención de race conditions** — \`SELECT FOR UPDATE SKIP LOCKED\` + transacciones de base de datos para evitar doble reserva
- **Encriptación de secretos** — AES-256-GCM para tokens de terceros; HMAC para validación de estado OAuth y webhooks
- **Reportes exportables** — Excel (ExcelJS) y PDF (PDFKit) con datos de turnos y facturación

### Stack técnico

**Backend** — Node.js · Express 5 · TypeScript · Prisma 7 · PostgreSQL 16 · Redis · Zod 4

**Frontend** — Next.js 14 (App Router) · TypeScript · shadcn/ui · Tailwind CSS · TanStack Query v5 · Zustand · React Hook Form

**Testing** — Vitest · Supertest · Testcontainers (PostgreSQL + Redis)

**Integraciones** — MercadoPago · WhatsApp Meta Cloud API · Resend

**Infra** — Docker · Docker Compose

### Módulos

\`appointments\` · \`auth\` · \`payments\` · \`notifications\` · \`reports\` · \`accounting\` · \`products\` · \`sales\` · \`services\` · \`barbers\` · \`clients\` · \`availability\` · \`calendar-blocks\` · \`suppliers\` · \`branding\``;

  const projectsToSeed = [
    {
      id: 'proj-constructora-001',
      title: 'Constructora Web',
      slug: 'constructora-web',
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
      content: null,
    },
    {
      id: 'proj-pasteleria-002',
      title: 'Pastelería Online',
      slug: 'pasteleria-online',
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
      content: null,
    },
    {
      id: 'proj-barber-saas-003',
      title: 'GlowApp — Barber SaaS',
      slug: 'barber-saas',
      description:
        'Plataforma SaaS multi-tenant para barberías. 15+ módulos de negocio, pagos con MercadoPago, notificaciones WhatsApp/email, booking público y 131 tests de integración.',
      stack: [
        'Next.js',
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'PostgreSQL',
        'Redis',
        'Prisma',
        'Docker',
        'MercadoPago',
        'WhatsApp API',
        'Vitest',
      ],
      status: 'in_progress' as const,
      category: 'collaborative' as const,
      featured: true,
      order: 3,
      repoUrl: null,
      demoUrl: null,
      imageUrl: null,
      content: barberSaasContent,
    },
  ];

  for (const proj of projectsToSeed) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: proj,
      create: proj,
    });
    console.log(`Project seeded: ${proj.title}`);
  }

  // Seed services
  const servicesToSeed = [
    {
      id: 'svc-web-app-001',
      slug: 'aplicaciones-web',
      title: 'Aplicaciones Web',
      tagline: 'De la idea al producto en producción',
      description:
        'Desarrollo full-stack de aplicaciones web a medida. APIs robustas, frontends modernos y bases de datos optimizadas para escalar.',
      iconName: 'Code2',
      stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Docker'],
      deliverables: [
        'API REST documentada',
        'Panel de administración',
        'Deploy en producción',
        'Código fuente completo',
      ],
      estimatedTimeline: '4–8 semanas',
      priceRange: 'Desde USD 1.500',
      isActive: true,
      featured: true,
      order: 1,
    },
    {
      id: 'svc-saas-002',
      slug: 'saas-multi-tenant',
      title: 'SaaS Multi-tenant',
      tagline: 'Plataformas que crecen con tu negocio',
      description:
        'Arquitectura multi-tenant desde el día uno. Auth enterprise, pagos integrados, notificaciones automáticas y dashboards por cliente.',
      iconName: 'LayoutDashboard',
      stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'MercadoPago', 'Stripe'],
      deliverables: [
        'Arquitectura multi-tenant',
        'Auth + roles + permisos',
        'Integración de pagos',
        'Panel por cliente',
      ],
      estimatedTimeline: '8–16 semanas',
      priceRange: 'Desde USD 3.000',
      isActive: true,
      featured: true,
      order: 2,
    },
    {
      id: 'svc-landing-003',
      slug: 'landing-pages',
      title: 'Landing Pages',
      tagline: 'Primera impresión que convierte',
      description:
        'Landings de alta conversión con diseño profesional, animaciones fluidas y optimización SEO. Rápidas, accesibles y mobile-first.',
      iconName: 'Globe',
      stack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
      deliverables: [
        'Diseño responsive',
        'Animaciones personalizadas',
        'SEO optimizado',
        'Score Lighthouse 90+',
      ],
      estimatedTimeline: '1–2 semanas',
      priceRange: 'Desde USD 500',
      isActive: true,
      featured: false,
      order: 3,
    },
  ];

  for (const svc of servicesToSeed) {
    await prisma.service.upsert({
      where: { id: svc.id },
      update: svc,
      create: svc,
    });
    console.log(`Service seeded: ${svc.title}`);
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
