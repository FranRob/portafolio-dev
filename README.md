# Franco Robles — divMalCentrado

**Full Stack Developer · LLM Orchestration · Available for hire**
Argentina · [linkedin.com/in/francorob](https://www.linkedin.com/in/francorob) · [divmalcentrado.vercel.app](https://divmalcentrado.vercel.app)

---

## About

Full Stack Developer with 2 years of experience building web applications end-to-end — from database design to UI. Focused on clean architecture, typed codebases, and AI-assisted development workflows.

---

## Tech Stack

**Frontend**
- React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion

**Backend**
- Node.js · Express 5 · TypeScript (ESM) · Prisma ORM · PostgreSQL

**Infrastructure**
- Docker · Vercel · Render · Neon (serverless PostgreSQL)

**Practices**
- Clean Architecture · REST APIs · JWT Auth · LLM Orchestration · CI/CD

---

## This Project

Developer portfolio with analytics tracking and admin dashboard.

**Live:** [divmalcentrado.vercel.app](https://divmalcentrado.vercel.app)

**Features:**
- Public portfolio with Projects, Stack, About and Contact sections
- Analytics tracking per section via IntersectionObserver
- Admin dashboard with full CRUD for projects and contact messages
- Dockerized full-stack setup with automated deploys on push to `main`

---

## Local Setup

```bash
# Clone
git clone https://github.com/FranRob/portafolio-dev.git
cd portafolio-dev

# Environment
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# Docker (recommended)
docker compose up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

Frontend at `http://localhost:5173` · Backend at `http://localhost:3001`

---

## Project Structure

```
portafolio-dev/
├── backend/               # Express API
│   ├── src/modules/       # auth | analytics | contact | projects
│   ├── src/middleware/    # JWT auth
│   └── prisma/            # Schema + migrations + seed
└── frontend/              # React SPA
    └── src/
        ├── components/    # sections | admin | layout | ui
        ├── services/      # Axios API client
        └── hooks/         # useAnalytics
```

---

© 2026 Franco Robles
