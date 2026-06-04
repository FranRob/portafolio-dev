# AGENTS.md — portafolio-dev

Code review rules for external agents (GGA, CI bots).

---

## Git Workflow — STRICT RULES

- **NEVER push directly to `main` without explicit user permission.**
- All changes: feature branch → PR → `develop` → reviewed → `main`.
- Feature branches: `feat/*`, `fix/*`, `chore/*` — always from `develop`.
- Hotfixes to `main` still require user confirmation before push.

---

## Project Context

**portafolio-dev** — Developer portfolio SPA (React 19 + Express 5 + PostgreSQL 16).

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, TypeScript 6 |
| Routing | react-router v7 (BrowserRouter) — NOT react-router-dom |
| Animation | motion@12 — import from `motion/react`, NOT `framer-motion` |
| Icons | lucide-react v1 (brand icons via custom `BrandIcons.tsx`) |
| Backend | Express 5, Node 22, TypeScript 6, pnpm 11 |
| ORM | Prisma 7 + adapter-pg — singleton at `src/lib/prisma.ts` |
| Auth | JWT access + refresh, CSRF double-submit cookie, bcryptjs |
| Testing | Vitest 4 + Testcontainers (backend), Vitest 4 + jsdom (frontend) |
| Production | Vercel (frontend), Render/Docker (backend), Neon (PostgreSQL) |

---

## API Contract

All routes prefixed `/api/`. Auth = JWT via `Authorization` header. CSRF = double-submit cookie required on mutating routes.

| Method | Path | Auth | CSRF |
|--------|------|------|------|
| POST | /auth/login | — | — |
| POST | /auth/refresh | — | — |
| POST | /auth/logout | ✓ | — |
| GET | /auth/me | ✓ | — |
| PATCH | /auth/password | ✓ | ✓ |
| POST | /auth/2fa/setup | ✓ | ✓ |
| GET | /auth/2fa/status | ✓ | — |
| POST | /auth/2fa/enable | ✓ | ✓ |
| POST | /auth/2fa/disable | ✓ | ✓ |
| POST | /analytics/track | — | — |
| GET | /analytics/stats | ✓ | — |
| POST | /contact | — | — |
| GET | /contact/messages | ✓ | — |
| PATCH | /contact/:id/read | ✓ | ✓ |
| PATCH | /contact/:id/unread | ✓ | ✓ |
| PATCH | /contact/:id/category | ✓ | ✓ |
| DELETE | /contact/:id | ✓ | ✓ |
| GET | /projects | — | — |
| POST | /projects | ✓ | ✓ |
| PATCH | /projects/:id | ✓ | ✓ |
| DELETE | /projects/:id | ✓ | ✓ |

---

## Code Conventions

### General
- **ESM throughout.** Backend imports: `.js` extensions on internal paths. Frontend: no extensions.
- **No hardcoded hex/RGB in components.** Use Tailwind tokens or CSS variables (see below).
- **Prisma:** always import from `src/lib/prisma.ts` — never `new PrismaClient()` directly.
- **Analytics:** every portfolio section component must call `useAnalytics(sectionName)`.
- **Admin auth:** JWT in `sessionStorage` as `admin_token`. Redirect on failed refresh: `/admin/login`.

### Frontend
- All interactive elements (`button`, `a`, `select`, `onClick`) must have `cursor-pointer`.
- Buttons with `disabled`: `cursor-pointer` for enabled state + `disabled:cursor-not-allowed`.
- `Variants` type from `motion/react` must be explicitly annotated on variant objects.

### Backend
- Express 5 — intentional, no plans to migrate.
- CSRF: `crypto.timingSafeEqual` requires equal-length buffers — always check lengths first.
- Rate limiting is in-memory; resets on server restart.

### Testing
- Backend: real PostgreSQL via Testcontainers — no DB mocks.
- Frontend: `vi.mock` with `vi.hoisted` factories — no JSX inside mock factory closures.
- Never use `vi.useFakeTimers()` — breaks userEvent/React.

---

## Available Theme Tokens

When flagging hardcoded colors, suggest the appropriate token:

**Tailwind color classes** (use as `text-*`, `bg-*`, `border-*`):
`neon-purple` (#b026ff) · `neon-cyan` (#00e5ff) · `neon-magenta` (#ff00ff)
`dark-base` (#0a0a0f) · `dark-card` (#12121a) · `dark-border` (#1e1e2e)

**CSS custom properties** (defined in `frontend/src/index.css`):

| Variable | Value | Use case |
|---|---|---|
| `--error-color` | #ff5555 | Error text |
| `--error-bg` | rgba(255,85,85,0.1) | Error backgrounds |
| `--error-border` | rgba(255,85,85,0.3) | Error borders |
| `--shadow-purple-sm` | rgba(176,38,255,0.2) | Subtle purple glow |
| `--shadow-purple-lg` | rgba(176,38,255,0.4) | Strong purple glow |
| `--shadow-cyan-sm` | rgba(0,229,255,0.2) | Subtle cyan glow |
| `--shadow-cyan-lg` | rgba(0,229,255,0.4) | Strong cyan glow |
| `--status-in-progress` | #b026ff | Badge: in progress |
| `--status-completed` | #00e5ff | Badge: completed |
| `--status-private` | #4a4a5a | Badge: private |
| `--social-purple` / `--social-cyan` | #b026ff / #00e5ff | Social card colors |
| `--input-focus-shadow` | rgba(176,38,255,0.2) | Input focus ring |
| `--dark-lighter` | #0e0e18 | Section backgrounds |
| `--terminal-bg` | #0d0d16 | Code block backgrounds |

For opacity variants without a dedicated variable, use `color-mix()`:
`color-mix(in srgb, var(--error-color) 10%, transparent)`

---

## What to Flag in Review

- Hardcoded hex/RGB colors in `.tsx` or `.ts` files (outside `index.css`)
- `new PrismaClient()` instantiation outside `src/lib/prisma.ts`
- `from 'framer-motion'` or `from 'react-router-dom'` imports
- Missing `cursor-pointer` on interactive elements
- `package-lock.json` committed (project uses pnpm)
- Push to `main` without user confirmation
- `vi.mock` factory closures containing JSX
- `crypto.timingSafeEqual` called without prior buffer length check
- Route missing auth/CSRF where the contract above requires it
- Section component missing `useAnalytics()` call
