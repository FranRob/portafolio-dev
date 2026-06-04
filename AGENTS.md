# AGENTS.md — portafolio-dev

Code review rules and project context for AI agents (GGA, Claude Code, etc.).

---

## Git Workflow — STRICT RULES

- **NEVER push directly to `main` without explicit user permission.**
- All changes go through a feature branch → PR → `develop` → reviewed → `main`.
- Feature branches: `feat/*`, `fix/*`, `chore/*` branched from `develop`.
- After merging to `main`, sync `develop` via fast-forward — but ask first.
- Hotfixes to `main` still require user confirmation before push.

---

## Project Context

**portafolio-dev** — Developer portfolio SPA for Franco Robles (divMalCentrado).

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, TypeScript 6 |
| Routing | react-router v7 (BrowserRouter) |
| Animation | motion@12 (import from `motion/react`) |
| Icons | lucide-react v1 (brand icons: custom `BrandIcons.tsx`) |
| Backend | Express 5, Node 22, TypeScript 6 |
| ORM | Prisma 7 with adapter-pg (PostgreSQL 16) |
| Auth | JWT (access + refresh), CSRF double-submit, bcryptjs |
| Package manager | pnpm 11.4.0 (both frontend and backend) |
| Testing | Vitest 4 + jsdom (frontend), Vitest 4 + Testcontainers (backend) |
| Containers | Docker + docker compose (nginx on port 80) |
| Production | Vercel (frontend), Render/Docker (backend), Neon (PostgreSQL) |

### Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, requires explicit permission to push |
| `develop` | Staging — local Docker containers test here |
| `feat/*` | Feature branches — always branch from `develop` |

---

## Code Conventions

### General
- **ESM throughout.** Backend imports use `.js` extensions. Frontend imports do not.
- **No hardcoded hex/RGB colors in components.** Always use Tailwind tokens (`neon-purple`, `dark-card`, etc.) or CSS custom properties (`var(--shadow-purple-sm)`, `var(--error-color)`, etc.).
- All color tokens and CSS variables are defined in `frontend/src/index.css`.
- **Prisma client:** always import from `src/lib/prisma.ts` — never instantiate directly.
- **Analytics tracking:** every portfolio section component must call `useAnalytics(sectionName)` and attach the returned ref to the section element.
- **Admin auth:** JWT stored in `sessionStorage` as `admin_token`. Axios interceptor in `api.ts` injects it. 401 triggers refresh; if refresh fails, clears token and redirects to `/admin/login`.

### Frontend
- Tailwind custom classes: `neon-purple`, `neon-cyan`, `neon-magenta`, `dark-base`, `dark-card`, `dark-border`.
- All interactive elements (`button`, `a`, `select`, elements with `onClick`) must have `cursor-pointer`.
- Buttons with `disabled` state: use `cursor-pointer` for enabled + `disabled:cursor-not-allowed`.
- No `framer-motion` — use `motion/react`. No `react-router-dom` — use `react-router`.
- `Variants` type from `motion/react` must be explicitly annotated on variant objects.

### Backend
- Express 5 (intentional — no plans to migrate).
- All route files use async handlers; errors propagate to Express error middleware.
- CSRF: double-submit cookie pattern. `timingSafeEqual` requires equal-length buffers — always check lengths before comparing.
- Rate limiting is in-memory (express-rate-limit); resets on restart.

### Testing
- **Strict TDD:** RED → GREEN → REFACTOR.
- Backend tests use real PostgreSQL via Testcontainers — no mocks.
- Frontend tests: `vi.mock` with `vi.hoisted` factories returning plain strings (no JSX in mock factories).
- Never use `vi.useFakeTimers()` — breaks userEvent/React.
- Test mocks reference `react-router` (not `react-router-dom`) and `motion/react` (not `framer-motion`).

---

## What to Flag in Review

- Hardcoded hex/RGB colors in `.tsx` or `.ts` files (outside `index.css`)
- Direct `new PrismaClient()` instantiation outside `src/lib/prisma.ts`
- `from 'framer-motion'` or `from 'react-router-dom'` imports
- Missing `cursor-pointer` on interactive elements
- `package-lock.json` committed (project uses pnpm)
- Push to `main` without user confirmation
- `vi.mock` with JSX inside factory closures
- `crypto.timingSafeEqual` called without prior length check
