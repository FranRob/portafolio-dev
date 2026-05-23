# Design: F2 Performance

## Technical Approach

5 cambios independientes, single PR. Cada cambio está localizado a un archivo con diff mínimo (<20 líneas cada uno). No hay cambios en flujo de datos ni contratos de API.

## Architecture Decisions

### F2.1 — Admin Code Splitting

| Opción | Tradeoff |
|--------|----------|
| `React.lazy` + `Suspense` per sub-component | ✅ Ya usamos `React.lazy` en Dashboard. Sin deps nuevas. |
| Route-based splitting (convertir tabs a rutas) | Scope creep, rompe persistent state en sessionStorage |
| `react-loadable` | Dep externa innecesaria |

**Decisión**: `React.lazy()` en Login (App.tsx) + en AdminMessages/AdminProjects/AdminSettings (Dashboard.tsx) con `Suspense` individual por tab. Eliminar `.then(m => ({ default: m.default }))` redundante.

### F2.2 — Font Loading

| Opción | Tradeoff |
|--------|----------|
| `media="print" onload="this.media='all'"` | ✅ 3 líneas, 0 deps, soporte 97%+ |
| Self-hosting fonts | Scope F3, requiere descargar + servir woff2 |
| `preload` as="style" | Menos testeado para este patrón |

**Decisión**: Cambiar `<link rel="stylesheet">` a `<link rel="stylesheet" media="print" onload="this.media='all'">` + fallback `<noscript>`.

### F2.3 — Critical CSS

| Opción | Tradeoff |
|--------|----------|
| Manual inline `<style>` en index.html | ✅ 5-8 props, 0 deps |
| `vite-plugin-critical` | Complejidad de build, extrae CSS vía Puppeteer |
| WebFontLoader JS | Dep innecesaria |

**Decisión**: Bloque `<style>` inline con `body background`, `color`, `overflow-x`, `scroll-behavior`, `position`. Coincide exactamente con lo que produce Tailwind.

### F2.4 — Image Optimization

| Opción | Tradeoff |
|--------|----------|
| Native `loading="lazy"` + `width`/`height` | ✅ 95%+ soporte, 0 overhead JS |
| IntersectionObserver + JS | Código extra, re-inventar la rueda |
| `vite-plugin-image-optimizer` | No tenemos imágenes locales para optimizar |

**Decisión**: Atributos nativos HTML. `width` usa el contenedor (100% del parent), `height` usa la clase existente. Sin nuevas deps.

### F2.5 — Static Cache

| Opción | Tradeoff |
|--------|----------|
| Extender regex existente con `webp`\|`avif` | ✅ 1 regex change |
| Location blocks separados | Más código, mismo resultado |

**Decisión**: Agregar `webp` y `avif` al regex en nginx.conf.

## Data Flow

Sin cambios — todas las optimizaciones son build-time (code splitting, CSS inline) o server-config (nginx regex).

## File Changes

| File | Acción | Descripción |
|------|--------|-------------|
| `frontend/src/App.tsx` | Modify | Login lazy + Dashboard import cleanup |
| `frontend/src/components/admin/Dashboard.tsx` | Modify | React.lazy + Suspense por tab |
| `frontend/index.html` | Modify | Font loading non-blocking + inline critical CSS |
| `frontend/src/components/sections/ProjectCard.tsx` | Modify | loading="lazy" + width/height en img |
| `frontend/docker/nginx.conf` | Modify | webp\|avif en regex cache |

## Testing Strategy

| Capa | Qué | Cómo |
|------|-----|------|
| Build | Frontend compila | `cd frontend && npm run build` |
| Visual | Sin regresiones | Revisar portfolio, admin login, admin tabs |
| Network | Code splitting | DevTools Network: chunks separados |
| Lighthouse | Performance ≥92 | Lighthouse report |

## Migration / Rollout

Sin migración. Todos los cambios son aditivos. Static assets con nuevos cache headers toman efecto inmediato al recargar nginx.

## Open Questions

None.
