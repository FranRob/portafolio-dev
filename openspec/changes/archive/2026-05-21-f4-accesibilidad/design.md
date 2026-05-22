# Design: F4 — Accesibilidad & UX

## Technical Approach

5 independent additive changes targeting Lighthouse 96→98+. Single PR (<400 lines). Each file touched individually — no cross-file dependency, no cascade risk, no migrations. Contrast fix at tailwind config level propagates to all components automatically. Skip link uses Tailwind's `sr-only/focus:not-sr-only` pattern. Focus rings via global `:focus-visible` CSS rule — covers every interactive element without per-component audit.

## Architecture Decisions

### Decision: Focus indicators — global CSS vs per-component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Global `:focus-visible` in index.css | Single rule, covers everything, works on elements without Tailwind classes | ✅ **Chosen** |
| Tailwind `focus:ring` per component | Consistent but requires touching every button/link/input | ❌ Too many interactive elements, easy to miss one |

**Rationale**: Global rule catches every element including canvas wrappers, admin panels, and any future component. Per-component approach would need an audit of ~30+ interactive elements and every new one would need explicit classes.

### Decision: Gray color fix — config level vs per-component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Override gray-500/gray-600 in tailwind config | Single change, auto-propagates to all `text-gray-*` usages | ✅ **Chosen** |
| Per-component class replacement | Surgical but error-prone, easily misses instances | ❌ Would need to grep 20+ files |

**Rationale**: All gray text uses (descriptions, labels, timestamps, copyright) are content that needs AA compliance. Config override (`gray-500: '#9ca3af'`, `gray-600: '#6b7280'`) fixes every instance with one change. No gray is used for critical interactive elements where changing shade could cause confusion.

### Decision: Skip link — sr-only Tailwind pattern

**Choice**: `sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]`
**Alternatives**: Separate CSS class, portal rendering
**Rationale**: Follows Tailwind's official accessible hiding pattern. `sr-only` hides visually, `focus:not-sr-only` reveals on keyboard focus. No custom CSS needed. Placed as first child of `PortfolioPage` wrapper div — first tab stop.

### Decision: Vitest config — inline vs separate file

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inline in `vite.config.ts` | Single config, Vite handles TS, no duplication | ✅ **Chosen** |
| Separate `vitest.config.ts` | Cleaner separation but duplicates Vite config | ❌ Extra file, configuration drift risk |

**Rationale**: Vitest is designed for Vite config reuse. Adding `/// <reference types="vitest" />` and `test` block keeps everything in one file. No complex Vitest plugins needed (jsdom environment is simple).

### Decision: Test file co-location

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `*.test.tsx` beside component | Tests live next to source, easy to find, Vitest globs by default | ✅ **Chosen** |
| `__tests__/` directory | Cleaner src/ but breaks locality, harder to maintain | ❌ Adds indirection, no benefit for unit tests |

**Rationale**: Co-location is the React community convention for component tests. Vitest discovers `*.test.tsx` files automatically. Tests import their component with a relative path — no deep imports needed.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `PortfolioPage.tsx` | Modify | Add `<a href="#main-content">` skip link before `<Navbar />` + `id="main-content"` to `<main>` |
| `Navbar.tsx` | Modify | `aria-label` on all nav `<button>`s, brand `<span>` → `<button>` with `aria-label`, mobile toggle gets `aria-expanded` |
| `Footer.tsx` | Modify | `aria-label="Admin panel"` on admin `<button>`, `aria-label="Volver al inicio"` on brand |
| `Hero.tsx` | Modify | `aria-label="Ver mi Stack tecnológico"` and `aria-label="Contactarme"` on CTA buttons |
| `Contact.tsx` | Modify | `aria-label` on social links (`"LinkedIn - Franco Robles"`, `"GitHub - divMalCentrado"`), fix `outline: none` on inputs — replace with cyan focus-visible outline |
| `Stack.tsx` | Modify | `aria-hidden="true"` on constellation SVG container + sr-only fallback `<div>` listing tech names |
| `ProjectCard.tsx` | Modify | `aria-label` on "Ver demo" and "Ver código" external links |
| `StarField.tsx` | Modify | `aria-hidden="true"` on `<canvas>` container element |
| `Login.tsx` | Modify | Remove `outline: 'none'` from inline focus styles — global `:focus-visible` covers it |
| `Dashboard.tsx` | Modify | `aria-label` on tab buttons ("Métricas", "Mensajes", "Proyectos", "Ajustes"), refresh button, logout button |
| `AdminMessages.tsx` | Modify | `aria-label` on action buttons ("Marcar como leído", "Mover a...", "Eliminar mensaje") |
| `AdminProjects.tsx` | Modify | `aria-label` on edit, delete, reorder buttons |
| `AdminSettings.tsx` | Modify | `aria-label` on 2FA toggle, password change, eye toggle buttons |
| `index.css` | Modify | Add global `:focus-visible { outline: 2px solid #00e5ff; outline-offset: 2px; }` |
| `tailwind.config.ts` | Modify | Override `gray.500: '#9ca3af'`, `gray.600: '#6b7280'` |
| `package.json` | Modify | Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` devDeps + `test` script |
| `vite.config.ts` | Modify | Add `/// <reference types="vitest" />` + `test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' }` |
| `src/test-setup.ts` | Create | Import `@testing-library/jest-dom` matchers once |
| `Navbar.test.tsx` | Create | Test links render + mobile toggle visibility |
| `Contact.test.tsx` | Create | Test form doesn't submit with empty fields, social links render |
| `Hero.test.tsx` | Create | Test CTAs render + `useAnalytics` called with `'hero'` |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Navbar: nav links render, admin link present, mobile toggles | Render `<Navbar />`, assert link texts, click hamburger, assert mobile menu visible |
| Unit | Contact: form validation states | Submit with empty fields → status stays idle (no API call). Submit with fields → status changes to 'sending' |
| Unit | Hero: CTAs render, analytics hook | Assert "Ver mi Stack" and "Contactarme" buttons in DOM. Mock `useAnalytics` and verify called with `'hero'` |

**Test environment**: Vitest + jsdom + @testing-library/react. Setup file imports `@testing-library/jest-dom` for DOM matchers (`toBeInTheDocument`, `toHaveAttribute`, etc.). **Note**: Contact form doesn't show inline validation errors — tests verify the form silently rejects empty submissions (current behavior). Validation error display is a known gap, flagged but out of scope.

## Migration / Rollout

No migration required. All changes are additive/config. Revert individually with `git checkout <file>`. Vitest deps removable from `package.json` + `vite.config.ts`.

## Open Questions

- [x] None — all decisions resolved from codebase reading
