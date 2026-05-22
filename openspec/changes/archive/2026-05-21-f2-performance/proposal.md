# Proposal: F2 Performance

## Intent

Mejorar Performance de Lighthouse de ~88 a ~92+ reduciendo render-blocking resources, code-splitting del admin panel, optimizando imágenes, y agregando critical CSS inline. F2 del roadmap de optimización.

## Scope

### In Scope
- **F2.1**: Lazy loading del admin panel — Login, AdminMessages, AdminSettings, AdminProjects con `React.lazy` + `Suspense`
- **F2.2**: Google Fonts CSS no-blocking (`media="print" onload="this.media='all'"`)
- **F2.3**: Critical CSS inline mínimo (body bg, text color, font-family) en `<style>` tag del head
- **F2.4**: `loading="lazy"` + `width`/`height` en `<img>` de ProjectCard
- **F2.5**: Cache headers — agregar `webp`/`avif` al regex estático

### Out of Scope
- Self-hosted fonts (F3 bundle optimization)
- Image conversion to WebP/AVIF (no local images beyond OG, external images are dynamic)
- Framer Motion lazy loading (F3)
- npm audit / dependency updates (F3)
- Accessibility / ARIA (F4)

## Capabilities

### New Capabilities
None — pure performance optimization, no behavioral changes.

### Modified Capabilities
None.

## Approach

5 independent changes, single PR:

| # | File(s) | Change |
|---|---------|--------|
| F2.1 | `App.tsx`, `Dashboard.tsx` | `React.lazy` Login + admin sub-components + individual Suspense boundaries |
| F2.2 | `index.html` | Google Fonts CSS con `media="print" onload="..."` + noscript fallback |
| F2.3 | `index.html` | Inline `<style>` bloque con base styles críticos |
| F2.4 | `ProjectCard.tsx` | `loading="lazy"` + `width`/`height` attributes |
| F2.5 | `nginx.conf` | Agregar `webp`\|`avif` al regex de cache estático |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/App.tsx` | Modified | Login lazy, Dashboard lazy cleanup |
| `frontend/src/components/admin/Dashboard.tsx` | Modified | Sub-components lazy with Suspense |
| `frontend/index.html` | Modified | Font loading + critical CSS |
| `frontend/src/components/sections/ProjectCard.tsx` | Modified | Img lazy loading + dimensions |
| `frontend/docker/nginx.conf` | Modified | WebP/AVIF in cache regex |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| FOUC from critical CSS | Low | Inline styles match Tailwind's output, no conflicts |
| Font flash from non-blocking CSS | Low | `display=swap` already in URL, fallback fonts defined |
| Tab component flash on first click | Low | Individual Suspense fallbacks per tab |

## Rollback Plan

Revert each file individually. Changes are independent — no cascading.

## Dependencies

None.

## Success Criteria

- [ ] Lighthouse Performance ≥92
- [ ] Admin panel tabs load individually (verify via Network tab)
- [ ] Google Fonts CSS does NOT appear as render-blocking in Lighthouse
- [ ] Project card images have `loading="lazy"` and explicit dimensions
- [ ] nginx cache headers include `webp` and `avif`
- [ ] `npm run build` succeeds in frontend
- [ ] Admin login + dashboard navigation works end-to-end
