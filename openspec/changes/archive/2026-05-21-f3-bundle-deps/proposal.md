# Proposal: F3 Bundle & Dependencias

## Intent

Reducir bundle JS de 356KB → ~250KB eliminando dead code, actualizando dependencias vulnerables, y optimizando imports. F3 del roadmap.

## Scope

### In Scope
- **F3.1**: Update vulnerable deps — axios, postcss, hono, path-to-regexp, follow-redirects
- **F3.2**: Remove dead code — `NeonBorder.tsx`, `useCache.ts`, `TabsSkeleton`/`FormSkeleton` (unused exports)
- **F3.3**: Lazy-load PortfolioPage wrapper to split framer-motion out of initial bundle
- **F3.4**: Tree-shaking pass — verify all imports are specific, no barrel imports

### Out of Scope
- Migrating to React 19 or Vite 8 (breaking changes from forced audit)
- Self-hosting Google Fonts (already handled in F1/F2)
- Adding tests for removed components (they're dead code)
- Backend dependency tree audit (separate concern)

## Capabilities

### New Capabilities
None — behavioral changes are zero.

### Modified Capabilities
None.

## Approach

| # | File(s) | Change |
|---|---------|--------|
| F3.1 | `frontend/package.json` | Update axios, postcss, follow-redirects (minor/patch) |
| F3.2 | Delete files | Remove `NeonBorder.tsx`, `useCache.ts`; cleanup dead exports from `AdminSkeleton.tsx` |
| F3.3 | `App.tsx` | Wrap `PortfolioPage` in `React.lazy` + `Suspense` to defer framer-motion |
| F3.4 | Various | Audit import specificity — already clean, no barrel imports found |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/package.json` | Modified | Dep version bumps |
| `frontend/src/components/ui/NeonBorder.tsx` | Delete | Dead component |
| `frontend/src/hooks/useCache.ts` | Delete | Dead hook |
| `frontend/src/components/admin/AdminSkeleton.tsx` | Modified | Remove unused exports |
| `frontend/src/App.tsx` | Modified | Lazy-load PortfolioPage |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| npm audit fix breaking change | Medium | Only update minor/patch; skip vite/esbuild force update |
| PortfolioPage lazy load shows flash | Low | Suspense fallback already exists from LoadingFallback |

## Rollback Plan

Revert each file individually. Dep bumps can be undone via `package.json` restore.

## Dependencies

- `npm install` after package.json changes

## Success Criteria

- [ ] `npm audit` shows zero frontend vulnerabilities (after fixable ones)
- [ ] `npm run build` succeeds in frontend
- [ ] Bundle size reduced measurably (dead code removed)
- [ ] No visual regressions on portfolio or admin
- [ ] framer-motion NOT in initial bundle chunk
