# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Code review rules and flagging criteria live in `AGENTS.md` — same conventions apply here.

## Project

**portafolio-dev** — Developer portfolio SPA for Franco Robles (divMalCentrado). PERN stack with analytics tracking and admin dashboard.

## Commands

### Backend (`backend/`)
```bash
pnpm run dev              # Dev server with hot-reload (port 3001)
pnpm run build            # Compile TypeScript → dist/
pnpm run prisma:migrate   # Run DB migrations
pnpm run prisma:generate  # Regenerate Prisma client after schema changes
pnpm run seed             # Seed admin user from env vars
```

### Frontend (`frontend/`)
```bash
pnpm run dev      # Vite dev server (port 5173, proxies /api → localhost:3001)
pnpm run build    # Type-check + Vite build → dist/
pnpm run preview  # Preview production build locally
```

### Docker (full stack)
```bash
cp .env.example .env      # Fill in required vars
docker compose up -d      # Start db + backend + frontend (nginx on port 80)
docker compose down -v    # Stop and remove volumes
```

After first `docker compose up`, run migrations inside the backend container:
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend pnpm run seed
```

## Architecture

```
portafolio-dev/
├── backend/               # Express 5 API (port 3001)
│   ├── src/
│   │   ├── modules/       # auth/ | analytics/ | contact/ | projects/
│   │   ├── middleware/    # JWT auth + CSRF
│   │   ├── lib/prisma.ts  # Prisma singleton (always import from here)
│   │   ├── app.ts         # Express setup + route mounting
│   │   └── server.ts      # Entry point
│   └── prisma/schema.prisma
├── frontend/              # React 19 SPA (Vite 8)
│   └── src/
│       ├── components/
│       │   ├── sections/  # Hero | Stack | About | Projects | Contact
│       │   ├── admin/     # Login | Dashboard | AdminProjects | AdminMessages | AdminSettings | ConfirmModal
│       │   ├── layout/    # Navbar | Footer
│       │   └── ui/        # StarField | GlitchText | NeonBorder | BrandIcons
│       ├── services/api.ts
│       └── hooks/useAnalytics.ts
├── docker-compose.yml     # db (postgres) + backend + frontend (nginx)
└── frontend/docker/nginx.conf   # SPA fallback + /api proxy
```

## API Contract

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login, returns access + refresh tokens |
| POST | /api/auth/refresh | — | Refresh access token via cookie |
| POST | /api/auth/logout | ✓ | Invalidate session |
| GET | /api/auth/me | ✓ | Current admin user |
| GET | /api/auth/audit | ✓ | Auth audit log |
| POST | /api/auth/unlock/:userId | ✓ | Unlock locked account |
| POST | /api/auth/2fa/setup | ✓ | Generate 2FA QR code |
| GET | /api/auth/2fa/status | ✓ | 2FA enabled status |
| POST | /api/auth/2fa/enable | ✓ | Enable 2FA with TOTP token |
| POST | /api/auth/2fa/disable | ✓ | Disable 2FA |
| PATCH | /api/auth/password | ✓ | Change password |
| POST | /api/analytics/track | — | Track section view |
| GET | /api/analytics/stats | ✓ | Dashboard stats |
| POST | /api/contact | — | Submit contact form |
| GET | /api/contact/messages | ✓ | List messages |
| PATCH | /api/contact/:id/read | ✓ | Mark message read |
| PATCH | /api/contact/:id/unread | ✓ | Mark message unread |
| PATCH | /api/contact/:id/category | ✓ | Move message to category |
| DELETE | /api/contact/:id | ✓ | Delete message |
| GET | /api/projects | — | List projects (public) |
| POST | /api/projects | ✓ + CSRF | Create project |
| PATCH | /api/projects/:id | ✓ + CSRF | Update project |
| DELETE | /api/projects/:id | ✓ + CSRF | Delete project |

## Key Conventions

- **ESM** throughout. Backend imports use `.js` extensions. Frontend imports do not.
- **Analytics tracking**: every section component uses `useAnalytics(sectionName)` hook.
- **Admin auth**: JWT stored in `sessionStorage` as `admin_token`. 401 triggers refresh; if refresh fails, clears token and redirects to `/admin/login`.
- **Theme tokens**: always use Tailwind custom classes (`neon-purple`, `neon-cyan`, `dark-card`, etc.) or CSS variables — never hardcode hex colors in components.
- **Prisma client**: always import from `src/lib/prisma.ts`, never instantiate directly.
- **Interactive elements**: all `button`, `a`, `select`, and `onClick` elements must have `cursor-pointer`.

## Environment Variables

Backend (`.env`):
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...    # Optional — derived from JWT_SECRET if not set
PORT=3001
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Docker (`.env` at root):
```
POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PORT
```
