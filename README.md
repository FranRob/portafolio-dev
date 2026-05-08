# Franco Robles — Portfolio

**Full Stack Developer · LLM Orchestration · Available for hire**
Argentina · [linkedin.com/in/francorob](https://www.linkedin.com/in/francorob) · [divmalcentrado.vercel.app](https://divmalcentrado.vercel.app)

---

## Acerca del Proyecto

Portfolio profesional de desarrollo web con tracking de analíticas y panel de administración. Construido con enfoque en **Clean Architecture** y separación clara entre frontend y backend.

**Stack:** React + TypeScript + Vite (Frontend) · Express + Prisma + PostgreSQL (Backend) · Docker

**Live:** [divmalcentrado.vercel.app](https://divmalcentrado.vercel.app)

---

## Stack Tecnológico

### Frontend
- **React 18** — UI library
- **TypeScript** — Tipado estático
- **Vite** — Build tool
- **Tailwind CSS** — Estilos utility-first
- **Framer Motion** — Animaciones
- **Axios** — HTTP client
- **React Router** — Client-side routing

### Backend
- **Node.js** — Runtime
- **Express** — Web framework
- **TypeScript** — Tipado (ESM)
- **Prisma ORM** — Database ORM
- **PostgreSQL** — Base de datos
- **JWT** — Autenticación
- **Zod** — Validación de datos
- **bcrypt** — Hash de contraseñas
- **otplib** — 2FA/TOTP

### Infraestructura
- **Docker** — Contenedores
- **Vercel** — Frontend hosting
- **Render** — Backend hosting
- **Neon** — PostgreSQL serverless

---

## Arquitectura de Diseño

### Clean Architecture (Ports & Adapters)

El proyecto sigue **Clean Architecture** con separación en capas:

```
src/
├── modules/          # CASO DE USO (Use Cases)
│   ├── auth/
│   ├── analytics/
│   ├── contact/
│   └── projects/
├── middleware/      # FRAMEWORK ADAPTERS
│   └── auth.ts
├── lib/            # PUERTS (Interfaces)
│   └── prisma.ts
└── app.ts          # ENTRY POINT
```

| Capa | Descripción |
|------|------------|
| **Modules** | Lógica de negocio (routes + service) — independiente de framework |
| **Middleware** | Adaptadores de auth y seguridad |
| **Lib** | Interfaces/ports (Prisma client) |
| **App** | Configuración Express |

### Frontend — Atomic Design

```
src/components/
├── sections/    # Componentes de página (Hero, Stack, About, Projects, Contact)
├── admin/      # Panel administrativo (Login, Dashboard, AdminProjects, AdminMessages)
├── layout/      # Estructural (Navbar, Footer)
└── ui/         # Componentes reutilizables (StarField, GlitchText, NeonBorder)
```

---

## Características

### Público
- Portfolio con secciones: Hero, Stack, Sobre mí, Proyectos, Contacto
- Tracking de analíticas por sección (IntersectionObserver al 50% de visibilidad)
- Proyectos con estado (En desarrollo, Live, Próximamente)
- Formulario de contacto con validación

### Administración
- Login con HTTP-only cookies + refresh tokens
- Rate limiting (5 intentos, 15min lockout)
- CSRF double-submit cookie pattern
- Audit logging de eventos de auth
- 2FA/TOTP opcional
- CRUD completo de proyectos y mensajes de contacto

---

## Estructura del Proyecto

```
portafolio-dev/
├── backend/               # Express API (port 3001)
│   ├── src/
│   │   ├── modules/   # auth | analytics | projects | contact
│   │   ├── middleware/ # JWT auth
│   │   └── lib/     # Prisma client
│   └── prisma/        # Schema + migrations + seed
├── frontend/              # React SPA (Vite, port 5173)
│   └── src/
│       ├── components/ # sections | admin | layout | ui
│       ├── services/  # API client
│       ├── hooks/    # useAnalytics
│       └── pages/
├── docker-compose.yml     # Full stack Docker
└── README.md
```

---

## Ramas (Git Flow)

| Rama | Propósito |
|------|---------|
| `main` | Producción |
| `develop` | Desarrollo activo |
| `feature/*` | Nuevas funcionalidades |
| `bugfix/*` | Arreglos de bugs |
| `hotfix/*` | Arreglos urgentes |

---

## Setup Local

```bash
# Clone
git clone https://github.com/FranRob/portafolio-dev.git
cd portafolio-dev

# Variables de entorno
cp .env.example .env
# Completar: DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY, ADMIN_EMAIL, ADMIN_PASSWORD

# Docker (recomendado)
docker compose up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

**Puertos:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Nginx: `http://localhost:80`

---

## API Endpoints

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login con cookies |
| POST | /api/auth/refresh | — | Refresh access token |
| POST | /api/auth/logout | ✓ | Logout |
| GET | /api/auth/me | ✓ | Usuario actual |
| GET | /api/analytics/stats | ✓ | Métricas del dashboard |
| POST | /api/analytics/track | — | Track sección |
| GET | /api/projects | — | Listar proyectos |
| POST | /api/projects | ✓ | Crear proyecto |
| PATCH | /api/projects/:id | ✓ | Actualizar proyecto |
| DELETE | /api/projects/:id | ✓ | Eliminar proyecto |
| POST | /api/contact | — | Enviar mensaje |
| GET | /api/contact/messages | ✓ | Listar mensajes |
| PATCH | /api/contact/:id/read | ✓ | Marcar leído |

---

## Seguridad Implementada

- Rate limiting (5 intentos, 15min lockout)
- HTTP-only secure cookies
- Refresh token rotation (15min access + 7d refresh)
- Account lockout tras intentos fallidos
- CSRF double-submit cookie pattern
- Audit logging
- 2FA/TOTP opcional
- Security headers (HSTS, CSP, X-Frame-Options)

---

© 2026 Franco Robles
