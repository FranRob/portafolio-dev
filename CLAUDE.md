# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**portafolio-dev** — Developer portfolio SPA for Franco Robles (divMalCentrado). PERN stack with analytics tracking and admin dashboard.

## Commands

### Backend (`backend/`)
```bash
npm run dev              # Dev server with hot-reload (port 3001)
npm run build            # Compile TypeScript → dist/
npm run prisma:migrate   # Run DB migrations
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run seed             # Seed admin user from env vars
```

### Frontend (`frontend/`)
```bash
npm run dev      # Vite dev server (port 5173, proxies /api → localhost:3001)
npm run build    # Type-check + Vite build → dist/
npm run preview  # Preview production build locally
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
docker compose exec backend npm run seed
```

## Architecture

```
portafolio-dev/
├── backend/               # Express API (port 3001)
│   ├── src/
│   │   ├── modules/       # auth/ | analytics/ | contact/
│   │   ├── middleware/    # JWT auth
│   │   ├── lib/prisma.ts  # Prisma singleton
│   │   ├── app.ts         # Express setup + route mounting
│   │   └── server.ts      # Entry point
│   └── prisma/schema.prisma
├── frontend/              # React SPA (Vite)
│   └── src/
│       ├── components/
│       │   ├── sections/  # Hero | Stack | About | Contact
│       │   ├── admin/     # Login | Dashboard
│       │   ├── layout/    # Navbar | Footer
│       │   └── ui/        # StarField | GlitchText | NeonBorder
│       ├── services/api.ts
│       └── hooks/useAnalytics.ts
├── docker-compose.yml     # db (postgres) + backend + frontend (nginx)
└── frontend/docker/nginx.conf   # SPA fallback + /api proxy
```

## API Contract

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Returns JWT token |
| GET | /api/auth/me | ✓ | Current admin user |
| POST | /api/analytics/track | — | Track section view |
| GET | /api/analytics/stats | ✓ | Dashboard stats |
| POST | /api/contact | — | Submit contact form |
| GET | /api/contact/messages | ✓ | List messages |
| PATCH | /api/contact/:id/read | ✓ | Mark message read |

## Key Conventions

- **ESM** throughout (both backend and frontend). Backend imports use `.js` extensions.
- **Analytics tracking**: every section component uses `useAnalytics(sectionName)` hook — it fires once via IntersectionObserver when the section reaches 50% visibility.
- **Admin auth**: JWT stored in `localStorage` as `admin_token`. The Axios instance in `api.ts` injects it automatically. A 401 response clears the token and redirects to `#/admin/login`.
- **Theme tokens**: always use Tailwind custom classes (`neon-purple`, `neon-cyan`, `dark-card`, etc.) — never hardcode hex colors in components.
- **Prisma client**: always import from `src/lib/prisma.ts`, never instantiate directly.

## Environment Variables

Backend (`.env`):
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3001
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Docker (`.env` at root):
```
POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PORT
```
