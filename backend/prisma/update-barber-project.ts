/**
 * One-off script: update barber-saas project with full data.
 * Run with: npx tsx prisma/update-barber-project.ts
 * Requires DATABASE_URL in environment (from .env or inline).
 */
import 'dotenv/config';
import { createPrismaClient } from '../src/lib/prisma.js';

const { prisma, pool } = createPrismaClient();

const content = `> **131 tests de integración** sobre PostgreSQL y Redis reales vía Testcontainers. Strict TDD aplicado en el 100% del backend.

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

async function main() {
  const result = await prisma.project.update({
    where: { id: 'proj-barber-saas-003' },
    data: {
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
      content,
    },
  });

  // Also ensure slugs exist for the other projects (required field)
  await prisma.project.updateMany({
    where: { id: 'proj-constructora-001', slug: null },
    data: { slug: 'constructora-web' },
  });
  await prisma.project.updateMany({
    where: { id: 'proj-pasteleria-002', slug: null },
    data: { slug: 'pasteleria-online' },
  });

  console.log(`Updated: ${result.title} (slug: ${result.slug})`);
  console.log('Slugs patched for constructora and pastelería if they were null.');
}

main()
  .catch((err) => {
    console.error('Update failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
