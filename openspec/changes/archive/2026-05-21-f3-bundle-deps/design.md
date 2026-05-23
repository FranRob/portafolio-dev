# Design: F3 Bundle & Dependencias

## Technical Approach

4 cambios independientes, single PR. Dos cambios de código, uno de configuración y uno de eliminación de archivos.

## Architecture Decisions

### F3.1 — Dep Updates

| Opción | Tradeoff |
|--------|----------|
| `npm audit fix` (minor/patch) | ✅ Seguro, sin breaking changes |
| `npm audit fix --force` | Rompe vite (v5→v8) y prisma (breaking) |

**Decisión**: `npm audit fix` solo para paquetes sin breaking changes. Forzar solo si no hay alternativa. Los fixables en frontend: axios (^1.7.0 → ^1.15.x), postcss (^8.4.0 → ^8.5.x), follow-redirects (subdep).

### F3.2 — Dead Code Removal

| Opción | Tradeoff |
|--------|----------|
| Borrar archivos + exports | ✅ Simple, directo |
| Comentar/ocultar código | ❌ Deja basura |

**Decisión**: Eliminar `NeonBorder.tsx`, `useCache.ts`, quitar exports `TabsSkeleton` y `FormSkeleton` de `AdminSkeleton.tsx`.

### F3.3 — PortfolioPage Code Split

| Opción | Tradeoff |
|--------|----------|
| Lazy-load PortfolioPage entero | ✅ Mueve framer-motion + sections a chunk separado |
| Lazy-load cada section individual | ❌ Waterfall de chunks, más complejo |
| Motion wrapper component | ❌ Invasivo, rompe tipado de motion |

**Decisión**: Extraer `PortfolioPage` a su propio componente lazy. Importa todas las sections + framer-motion. Se carga con `<Suspense fallback={<LoadingFallback />}>`.

### F3.4 — Tree-shaking

| Opción | Tradeoff |
|--------|----------|
| Audit imports manual | ✅ Ya está limpio, sin barrel imports |
| Agregar manualChunks en Vite | ❌ Optimización prematura |

**Decisión**: Audit de imports confirmó que no hay barrel imports. Sin cambios necesarios.

## Data Flow

Sin cambios de data flow. PortfolioPage lazy load agrega un Suspense boundary en App.tsx.

## File Changes

| File | Acción | Descripción |
|------|--------|-------------|
| `frontend/package.json` | Modify | Bump axios, postcss, follow-redirects |
| `frontend/src/components/ui/NeonBorder.tsx` | Delete | Dead code |
| `frontend/src/hooks/useCache.ts` | Delete | Dead code |
| `frontend/src/components/admin/AdminSkeleton.tsx` | Modify | Remove TabsSkeleton, FormSkeleton exports |
| `frontend/src/App.tsx` | Modify | Lazy-load PortfolioPage |

## Testing Strategy

| Capa | Qué | Cómo |
|------|-----|------|
| Build | Frontend compila | `npm run build` |
| Security | Audit | `npm audit` |
| Visual | Portfolio + Admin | Manual smoke test |

## Migration / Rollout

Sin migración. PortfolioPage lazy loading es transparente para el usuario.

## Open Questions

None.
