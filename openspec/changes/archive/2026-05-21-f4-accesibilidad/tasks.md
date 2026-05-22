# Tasks: F4 — Accesibilidad & UX

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250-350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All accessibility changes + tests | Single PR | All additive, no cross-file deps, under 400 lines |

## Phase 1: Infrastructure — Testing Setup

- [x] 1.1 Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` as devDependencies to `frontend/package.json` + add `"test": "vitest"` script
- [x] 1.2 Add vitest config block to `frontend/vite.config.ts`: `/// <reference types="vitest" />` + `test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' }`
- [x] 1.3 Create `frontend/src/test-setup.ts` — import `@testing-library/jest-dom` to register DOM matchers globally + IntersectionObserver polyfill for framer-motion

## Phase 2: Core Accessibility — Contrast, Focus, Skip Link

- [x] 2.1 Update `frontend/tailwind.config.ts` — override `gray.500: '#9ca3af'` and `gray.600: '#6b7280'` in the extended palette
- [x] 2.2 Add global `:focus-visible { outline: 2px solid #00e5ff; outline-offset: 2px; }` to `frontend/src/index.css`
- [x] 2.3 Fix `frontend/src/components/sections/Contact.tsx` — remove `outline: 'none'` from input inline styles
- [x] 2.4 Fix `frontend/src/components/admin/Login.tsx` — remove `outline: 'none'` from input inline styles
- [x] 2.5 Add skip-to-content link as first child of `frontend/src/PortfolioPage.tsx`: `<a href="#main-content" className="sr-only focus:not-sr-only ...">Saltar al contenido</a>` + add `id="main-content"` to the `<main>` wrapper

## Phase 3: ARIA Labels — All Interactive Elements

- [x] 3.1 `frontend/src/components/layout/Navbar.tsx` — `aria-label` on nav link buttons, convert brand `<span>` to `<button>` with `aria-label`, add `aria-label` + `aria-expanded` to mobile toggle
- [x] 3.2 `frontend/src/components/layout/Footer.tsx` — `aria-label` on admin link
- [x] 3.3 `frontend/src/components/sections/Hero.tsx` — `aria-label` on CTA buttons ("Ver mi Stack tecnológico", "Contactarme")
- [x] 3.4 `frontend/src/components/sections/Contact.tsx` — `aria-label` on social icon links ("LinkedIn - Franco Robles", "GitHub - divMalCentrado")
- [x] 3.5 `frontend/src/components/sections/Stack.tsx` — `aria-hidden="true"` on constellation SVG container + add screen-reader-only `<div>` listing tech names as fallback
- [x] 3.6 `frontend/src/components/sections/ProjectCard.tsx` — `aria-label` on external links ("Ver proyecto {name}", "Código fuente de {name}")
- [x] 3.7 `frontend/src/components/ui/StarField.tsx` — `aria-hidden="true"` on canvas container
- [x] 3.8 `frontend/src/components/admin/Dashboard.tsx` — `aria-label` on tab buttons ("Métricas", "Mensajes", "Proyectos", "Ajustes"), refresh button, logout button
- [x] 3.9 `frontend/src/components/admin/AdminMessages.tsx` — `aria-label` on action buttons ("Marcar como leído", "Mover a...", "Eliminar mensaje")
- [x] 3.10 `frontend/src/components/admin/AdminProjects.tsx` — `aria-label` on edit, delete, and reorder buttons
- [x] 3.11 `frontend/src/components/admin/AdminSettings.tsx` — `aria-label` on 2FA toggle, password change button, and password visibility eye toggle

## Phase 4: Testing — Verify Critical Components

- [x] 4.1 Create `frontend/src/components/layout/Navbar.test.tsx` — verify nav links ("Inicio", "Stack", "Proyectos", "Contacto") render, admin link present, mobile menu toggles on click
- [x] 4.2 Create `frontend/src/components/sections/Hero.test.tsx` — verify CTA buttons ("Contactame", "Ver Proyectos") render, GlitchText displays developer name, mock `useAnalytics` called with `'hero'`
- [x] 4.3 Create `frontend/src/components/sections/Contact.test.tsx` — verify form does not submit with empty fields, social links render with correct aria-labels
