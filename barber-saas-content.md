> **131 tests de integración** sobre PostgreSQL y Redis reales vía Testcontainers. Strict TDD aplicado en el 100% del backend.

### Implementaciones destacadas

- **Multi-tenancy estricta** — cada barbería tiene datos completamente aislados vía `tenantId` en cada query de Prisma; cascade delete en Tenant elimina toda la cadena
- **Auth enterprise-grade** — JWT 15min + refresh tokens rotativos 7d + blacklist en Redis para revocación inmediata; 2FA TOTP con dispositivos de confianza (30 días)
- **Pagos con MercadoPago** — OAuth 2.0 (authorize → callback → token encriptado con rotación proactiva); Checkout Pro para cobrar depósitos al momento de reservar
- **Notificaciones automáticas** — WhatsApp (Meta Cloud API) + email (Resend); cron cada 15 minutos; recordatorios a 1h y 15min antes del turno; retry con backoff exponencial
- **Booking público sin cuenta** — clientes reservan con nombre + teléfono; seguimiento de estado del turno vía token público
- **Prevención de race conditions** — `SELECT FOR UPDATE SKIP LOCKED` + transacciones de base de datos para evitar doble reserva
- **Encriptación de secretos** — AES-256-GCM para tokens de terceros; HMAC para validación de estado OAuth y webhooks
- **Reportes exportables** — Excel (ExcelJS) y PDF (PDFKit) con datos de turnos y facturación

### Stack técnico

**Backend** — Node.js · Express 5 · TypeScript · Prisma 7 · PostgreSQL 16 · Redis · Zod 4

**Frontend** — Next.js 14 (App Router) · TypeScript · shadcn/ui · Tailwind CSS · TanStack Query v5 · Zustand · React Hook Form

**Testing** — Vitest · Supertest · Testcontainers (PostgreSQL + Redis)

**Integraciones** — MercadoPago · WhatsApp Meta Cloud API · Resend

**Infra** — Docker · Docker Compose

### Módulos

`appointments` · `auth` · `payments` · `notifications` · `reports` · `accounting` · `products` · `sales` · `services` · `barbers` · `clients` · `availability` · `calendar-blocks` · `suppliers` · `branding`
