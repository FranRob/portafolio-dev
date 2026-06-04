# Roadmap: portafolio-dev Optimización

**Objetivo**: Performance ≥95, Accessibilidad 100, SEO 100, Best Practices 100, Security headers completos.

---

## Fase 1 — Quick Wins (1-2 hrs)

| # | Tarea | Esfuerzo | Impacto | Estado |
|---|-------|----------|---------|--------|
| 1 | Security Headers en nginx (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | 🟢 Bajo | 🔴 Alto | Pendiente |
| 2 | SEO: meta description + Open Graph tags en `index.html` | 🟢 Bajo | 🟡 Medio | Pendiente |
| 3 | SEO: `lang="es"` correcto + viewport meta | 🟢 Bajo | 🟡 Medio | Pendiente |
| 4 | Font display swap para Google Fonts | 🟢 Bajo | 🟢 Alto | Pendiente |
| 5 | Preconnect a origins externos (Google Fonts, APIs) | 🟢 Bajo | 🟡 Medio | Pendiente |

**Impacto esperado**: Best Practices 96→100, SEO 91→100, Performance 84→~88

---

## Fase 2 — Performance (3-4 hrs)

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 6 | Lazy loading de rutas: Dashboard, AdminMessages, AdminSettings con `React.lazy` | 🟡 Medio | 🔴 Alto |
| 7 | Reducir render-blocking resources | 🟡 Medio | 🔴 Alto |
| 8 | Critical CSS inline para above-the-fold | 🟡 Medio | 🟡 Medio |
| 9 | Image optimization: next-gen formats, lazy loading, dimensiones explícitas | 🟢 Bajo | 🟡 Medio |
| 10 | Cache headers para assets estáticos en nginx | 🟢 Bajo | 🟡 Medio |

**Impacto esperado**: Performance 84→92+, FCP de 2.8s → ~1.5s

---

## Fase 3 — Bundle & Dependencias (2-3 hrs)

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 11 | npm audit fix: actualizar axios, hono, path-to-regexp, postcss | 🟡 Medio | 🟡 Medio |
| 12 | Analizar bundle con `vite-plugin-visualizer` y eliminar dead code | 🟡 Medio | 🟡 Medio |
| 13 | Mover Framer Motion a lazy import (solo en secciones que lo usan) | 🟡 Medio | 🟢 Alto |
| 14 | Tree-shaking: revisar imports de librerías | 🟢 Bajo | 🟡 Medio |

**Impacto esperado**: Bundle JS de 361KB → ~250KB, FCP/LCP mejoran

---

## Fase 4 — Accesibilidad & UX (2-3 hrs)

| # | Tarea | Esfuerzo | Impacto | Estado |
|---|-------|----------|---------|--------|
| 15 | Skip-to-content link para navegación por teclado | 🟢 Bajo | 🟡 Medio | Pendiente |
| 16 | ARIA labels en interactive elements (nav, botones, icons) | 🟡 Medio | 🟢 Alto | Pendiente |
| 17 | Color contrast audit en toda la paleta neon | 🟡 Medio | 🟡 Medio | Pendiente |
| 18 | Focus indicators visibles para navegación por teclado | 🟢 Bajo | 🟡 Medio | Pendiente |
| 19 | Testing: cobertura de tests para componentes críticos | 🟡 Medio | 🟢 Alto | ✅ Completado |

**Impacto esperado**: Accessibility 96→100

---

## Fase 5 — Mobile & W3C (1-2 hrs)

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 20 | W3C HTML validation + fix errores | 🟡 Medio | 🟡 Medio |
| 21 | Mobile Friendly: touch targets, font sizes, viewport | 🟢 Bajo | 🟡 Medio |
| 22 | Safari fallbacks: -webkit prefixes, scrollbar styling | 🟢 Bajo | 🟢 Bajo |

**Impacto esperado**: Validación W3C sin errores, Mobile Friendly 100

---

## Resumen de impacto

| Métrica | Hoy | F1 | F2 | F3 | F4 | F5 |
|---------|:---:|:--:|:--:|:--:|:--:|:--:|
| Performance | 84 | ~88 | ~92 | ~95 | ~95 | ~95 |
| Accessibility | 96 | 96 | 96 | 96 | **100** | 100 |
| Best Practices | 96 | **100** | 100 | 100 | 100 | 100 |
| SEO | 91 | **100** | 100 | 100 | 100 | 100 |
| Security Headers | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bundle JS | 361KB | 361KB | 361KB | ~250KB | ~250KB | ~250KB |
| FCP | 2.8s | ~2.5s | ~1.5s | ~1.2s | ~1.2s | ~1.2s |

**Total estimado**: ~10-14 hrs distribuidas en 5 fases.

---

## Testing Coverage (Agregado F4-T19)

| Área | Tests | Framework | Stack |
|------|-------|-----------|-------|
| **Backend API** (auth, CRUD, rate-limit, CSRF) | 47 tests | Vitest 4.x + Supertest + Testcontainers | Express, Prisma, JWT, PostgreSQL |
| **Frontend Admin** (Login, Dashboard) | 39 tests | Vitest 2.x + jsdom + @testing-library/react | React 18, React Router, Framer Motion (mockeado) |
| **Total** | **86 tests** | — | — |

### Cobertura por flujo

| Flujo | Escenarios | Estado |
|-------|-----------|--------|
| Auth login (válido/inválido/rate-limit/CSRF) | 17 | ✅ |
| Admin CRUD Projects | 7 | ✅ |
| Admin CRUD Contact Messages | 7 | ✅ |
| Admin Analytics Stats | 3 | ✅ |
| Login component (loading/error/navegación/retry) | 12 | ✅ |
| Dashboard component (stats/tabs/logout/error) | 15 | ✅ |
| Health & endpoints públicos (preexistentes) | 6 | ✅ |
| **Total escenarios** | **67** (65 specs + 2 extras) | ✅ |

### Archivos de test creados/modificados

- `backend/tests/helpers/auth.ts` — seedAdmin, getValidToken, getAuthHeaders, getCsrfConfig
- `backend/tests/helpers/factories.ts` — createTestProject, createTestMessage
- `backend/tests/api.test.ts` — 47 tests (existente + extendido)
- `backend/src/middleware/auth.ts` — CSRF timingSafeEqual fix
- `frontend/src/test-setup.ts` — framer-motion global mock
- `frontend/src/components/admin/__tests__/Login.test.tsx` — 12 escenarios
- `frontend/src/components/admin/__tests__/Dashboard.test.tsx` — 15 escenarios

> **Nota**: Coverage tool no disponible en frontend (Vite plugin no compatible con Vitest 2.x). Backend coverage configurado pero no bloqueante.
