# Tasks: F3 Bundle & Dependencias

Delivery strategy: `single-pr` — 4 tasks, all independent.

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

## T-1: Update Vulnerable Dependencies (F3.1) ✅

- [x] Update `axios` from `^1.7.0` to `^1.15.0`
- [x] Update `postcss` from `^8.4.0` to `^8.5.10`
- [x] Run `npm install` — lockfile updated
- [x] `npm audit` — 2 mod vulns remain (esbuild via vite, would require breaking Vite 8 upgrade)
- [x] `npm run build` — passes

## T-2: Remove Dead Code (F3.2) ✅

- [x] Delete `NeonBorder.tsx`
- [x] Delete `useCache.ts`
- [x] Remove `TabsSkeleton` and `FormSkeleton` exports from `AdminSkeleton.tsx`
- [x] `npm run build` passes, no import errors

## T-3: Lazy-Load PortfolioPage (F3.3) ✅

- [x] Extract `PortfolioPage` to separate file `PortfolioPage.tsx`
- [x] Replace static import with `const PortfolioPage = lazy(() => import('./PortfolioPage'))`
- [x] Wrap in `<Suspense>`
- [x] Build: initial bundle 164KB (↓ from 356KB). Framer Motion in shared chunk (158KB)

## T-4: Tree-Shaking Audit (F3.4) ✅

- [x] No barrel imports existed
- [x] No remaining references to deleted files
