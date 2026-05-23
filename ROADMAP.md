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

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 15 | Skip-to-content link para navegación por teclado | 🟢 Bajo | 🟡 Medio |
| 16 | ARIA labels en interactive elements (nav, botones, icons) | 🟡 Medio | 🟢 Alto |
| 17 | Color contrast audit en toda la paleta neon | 🟡 Medio | 🟡 Medio |
| 18 | Focus indicators visibles para navegación por teclado | 🟢 Bajo | 🟡 Medio |
| 19 | Testing: cobertura de tests para componentes críticos | 🟡 Medio | 🟢 Alto |

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
