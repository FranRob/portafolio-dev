# Tasks: F2 Performance

Delivery strategy: `single-pr` — 5 independent changes, each <20 lines diff, total well under 400 lines.

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

## T-1: Admin Code Splitting (F2.1) ✅

**Files**: `frontend/src/App.tsx`, `frontend/src/components/admin/Dashboard.tsx`

### T-1.1: Lazy load Login in App.tsx
- [x] Convert `import Login from '...'` to `const Login = lazy(() => import('...'))`
- [x] Add `<Suspense>` boundary around `<Login />` in the route
- [x] Simplify `Dashboard` import: remove redundant `.then(m => ({ default: m.default }))`

### T-1.2: Code-split admin tabs in Dashboard.tsx
- [x] Replace static imports of `AdminMessages`, `AdminSettings`, `AdminProjects` with `React.lazy`
- [x] Wrap each tab render in individual `<Suspense>` with loading fallback
- [x] AdminMessages named export handled via `.then(m => ({ default: m.AdminMessages }))`

## T-2: Non-blocking Font Loading (F2.2) ✅

**File**: `frontend/index.html`

- [x] Remove `rel="stylesheet"` from Google Fonts `<link>`
- [x] Add `media="print" onload="this.media='all'"` 
- [x] Add `<noscript><link rel="stylesheet" href="..."></noscript>` fallback immediately after

## T-3: Critical CSS Inline (F2.3) ✅

**File**: `frontend/index.html`

- [x] Add `<style>` block with `html { scroll-behavior: smooth; overflow-x: hidden; } body { background-color: #0a0a0f; color: #e0e0e0; font-family: 'Space Mono', monospace; margin: 0; }`

## T-4: Image Optimization (F2.4) ✅

**File**: `frontend/src/components/sections/ProjectCard.tsx`

- [x] Add `loading="lazy"` attribute to the `<img>` tag
- Note: explicit width/height not needed — parent container `div.relative.h-32.sm:h-44` provides fixed aspect ratio

## T-5: Static Cache Headers (F2.5) ✅

**File**: `frontend/docker/nginx.conf`

- [x] Add `webp` and `avif` to the regex pattern: `\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|webp|avif)$`
