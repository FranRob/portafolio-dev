# Proposal: F4 — Accesibilidad & UX

## Intent

Improve Lighthouse Accessibility from 96→98+ with pragmatic WCAG AA compliance. 5 roadmap tasks that address the biggest gaps: missing skip link, no ARIA labels on interactive elements, gray text below contrast threshold, no focus indicators, zero frontend tests.

## Scope

### In Scope
1. Skip-to-content link as first focusable in PortfolioPage, targeting `<main id="main-content">`
2. ARIA labels on Navbar items, social links, CTAs, brand button, admin panel, StarField as `aria-hidden`
3. Color contrast: bump gray-500→gray-400, gray-600→gray-500. Neon-purple kept for large text (h1-h3, brand, buttons)
4. Focus indicators: global `:focus-visible` rule. Fix inputs suppressing outlines without replacement
5. Testing: vitest + jsdom + @testing-library/react + 3 critical component tests (Navbar, Contact, Hero)

### Out of Scope
Full WCAG 2.1 AAA, screen reader E2E (NVDA/VoiceOver), semantic HTML audit, reduced-motion preferences, 2FA prompt() fix, lang attributes, landmark roles.

## Capabilities

### New Capabilities
- `testing-setup`: Frontend test infrastructure (Vitest + RTL + jsdom) and component tests for Navbar, Contact form, Hero

### Modified Capabilities
None — pure refactor/add, no spec-level behavior changes.

## Approach

5 independent sequential tasks, single PR (<400 lines). Contrast fix is one config change in `tailwind.config.ts`. Each file touched individually — no cascading refactors. No dependency between tasks.

## Affected Areas

| Area | Impact | What changes |
|------|--------|-------------|
| `PortfolioPage.tsx` | Modified | Skip link + `<main id="main-content">` |
| `Navbar.tsx`, `Footer.tsx` | Modified | ARIA labels, brand `<span>`→`<button>` |
| `Hero.tsx`, `Stack.tsx` | Modified | ARIA on CTAs, tooltips |
| `ProjectCard.tsx` | Modified | ARIA on external links |
| `Contact.tsx`, `Login.tsx` | Modified | Fix `outline:none`, ARIA on social links |
| `admin/*.tsx` | Modified | ARIA on tabs, actions, controls |
| `StarField.tsx` | Modified | `aria-hidden="true"` |
| `index.css` | Modified | Global `:focus-visible` |
| `tailwind.config.ts` | Modified | gray-500→gray-400, gray-600→gray-500 |
| `package.json`, `vite.config.ts` | Modified | vitest + test libs |
| `*.test.tsx` (3 new) | New | Navbar, Contact, Hero tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Neon-purple fails AA for small text | Certain | Document as constraint — passes for large text |
| StarField canvas focus trap | Low | `pointer-events-none` prevents it |
| Stack SVG constellation inaccessible | Med | Add `aria-hidden` + screen-reader-only text fallback |
| Tests reveal pre-existing bugs | Med | Flag but don't block — fix separately |

## Rollback

Revert each file individually — no cross-file dependencies. vitest config removable from `package.json` + `vite.config.ts`. No migrations or data changes.

## Success Criteria

- [ ] Lighthouse Accessibility ≥98 (neon-purple prevents 100)
- [ ] `npm run build` succeeds
- [ ] `npm run test` passes (3 frontend + existing backend)
- [ ] Keyboard users can tab-visible "Skip to content" link
- [ ] All interactive elements have discernible focus rings
- [ ] Gray text passes WCAG AA (4.5:1 minimum)
