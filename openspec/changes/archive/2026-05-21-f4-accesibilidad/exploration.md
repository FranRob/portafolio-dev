## Exploration: F4 — Accesibilidad & UX

### Current State

The app is a visually polished dark-mode portfolio with a neon synthwave aesthetic, but accessibility is **almost entirely unaddressed**. There's no skip-to-content link, only 4 `aria-*` attributes across the entire frontend, no custom focus styles (and some inputs actively suppress outlines), color contrast fails WCAG AA in key spots (neon-purple body text, gray-500/600 used for descriptions), and frontend testing infrastructure is completely absent.

**Contrast ratios verified**:
| Pair | Ratio | WCAG AA norm | WCAG AA large | WCAG AAA |
|------|-------|:---:|:---:|:---:|
| neon-purple (#b026ff) on #0a0a0f | 4.30:1 | ❌ | ✅ | ❌ |
| neon-purple on card (#12121a) | 4.05:1 | ❌ | ✅ | ❌ |
| gray-500 (#6b7280) on #0a0a0f | 4.09:1 | ❌ | ✅ | ❌ |
| gray-600 (#4b5563) on #0a0a0f | 2.61:1 | ❌ | ❌ | ❌ |
| neon-cyan (#00e5ff) on #0a0a0f | 12.84:1 | ✅ | ✅ | ✅ |
| body (#e0e0e0) on #0a0a0f | 14.96:1 | ✅ | ✅ | ✅ |
| gray-400 (#9ca3af) on #0a0a0f | 7.78:1 | ✅ | ✅ | ✅ |

### Affected Areas

- `frontend/src/PortfolioPage.tsx` — add skip-to-content target `<main id="main-content">`
- `frontend/src/components/layout/Navbar.tsx` — skip link (first child), aria-labels on nav items, brand as button
- `frontend/src/components/layout/Footer.tsx` — aria-label on admin link
- `frontend/src/components/sections/Hero.tsx` — aria-labels on CTA buttons
- `frontend/src/components/sections/Contact.tsx` — aria-labels on social links, form validation feedback
- `frontend/src/components/sections/Stack.tsx` — keyboard-accessible tooltips on nodes
- `frontend/src/components/sections/ProjectCard.tsx` — aria-labels on external links
- `frontend/src/components/sections/About.tsx` — ARIA labels on trait cards
- `frontend/src/components/admin/Login.tsx` — focus indicator fix (remove `outline:none` without alternative)
- `frontend/src/components/admin/Dashboard.tsx` — aria-labels on tabs, buttons
- `frontend/src/components/admin/AdminMessages.tsx` — aria-labels on action buttons
- `frontend/src/components/admin/AdminProjects.tsx` — aria-labels on edit/delete/reorder
- `frontend/src/components/admin/AdminSettings.tsx` — aria-labels on 2FA/password controls
- `frontend/src/components/ui/StarField.tsx` — `aria-hidden="true"` on canvas
- `frontend/src/components/ui/GlitchText.tsx` — already has `aria-hidden="true"` on ghost layers (good)
- `frontend/tailwind.config.ts` — perhaps add a lighter purple variant for body text
- `frontend/src/index.css` — add `:focus-visible` global styles
- `frontend/package.json` — add vitest, jsdom, @testing-library/react
- `frontend/vite.config.ts` — add test configuration
- `frontend/src/**/*.test.tsx` — new test files

### Approaches

1. **Minimum Viable Accessibility (recommended)** — Fix only what the roadmap asks: skip link, ARIA labels on interactive elements, fix critical contrast failures (gray-500/600), add focus-visible styles, add vitest + basic component tests.
   - **Pros**: Focused effort (~3h as estimated), directly addresses roadmap tasks
   - **Cons**: Won't achieve 100 Lighthouse accessibility score
   - **Effort**: Medium (2-3 hrs)

2. **Full WCAG 2.1 AA compliance pass** — Everything in approach 1 plus: semantic HTML audit, full keyboard navigation audit, screen reader testing with NVDA/VoiceOver, form error announcements, landmark roles (`role="navigation"`, `role="main"`), dynamic content announcements (aria-live), reduced motion media queries, increased target sizes on mobile.
   - **Pros**: True accessibility, 100 Lighthouse score
   - **Cons**: Effort is 2-3x roadmap estimate (6-8 hrs), roadmap only budgets 2-3 hrs
   - **Effort**: High (6-8 hrs)

3. **Incremental with color contrast compromise** — Same as approach 1 but keep the neon aesthetic by only fixing contrast failures that are clear blockers (gray-600 at 2.61:1) and documenting purple-on-dark as acceptable for decorative/large text only. Accept neon-purple as a brand constraint for normal text.
   - **Pros**: Preserves brand identity, pragmatic
   - **Cons**: Still won't score 100, some users will struggle with purple body text
   - **Effort**: Medium (2-3 hrs)

### Recommendation

**Approach 1 (Minimum Viable)**, leaning toward approach 3 on the contrast question — the roadmap says 2-3 hrs and 96→100 score. The main score killers are:
1. Missing skip link (critical, ~0.5hr)
2. Missing ARIA labels (widespread but each is trivial, ~1hr)
3. Low-contrast gray-500/600 text (replace with gray-400, ~0.5hr)
4. Missing focus indicators (add global `:focus-visible`, ~0.25hr)
5. No frontend tests (add vitest + 3 critical component tests, ~1hr)

The neon-purple at 4.30:1 already passes for large text (h1-h3, brand, buttons). Don't change the purple — just bump the gray text values up one weight. Gray-500 → gray-400 and gray-600 → gray-500 solves the worst failures without touching the neon aesthetic.

### Risks

- **Neon-purple brand color**: Can't realistically change it without losing the visual identity. Accept that it fails AA for normal text and document it as a design constraint only for decorative/large text usage.
- **StarField canvas**: Canvas has no shadow DOM content, so `aria-hidden="true"` is sufficient — but make sure keyboard users aren't trapped by canvas focus. Currently `pointer-events-none` prevents this.
- **Stack constellation**: The SVG + floating divs pattern is inherently inaccessible (tooltips on hover only). Fixing this properly would require significant refactoring. For the scope of this task, add `aria-hidden="true"` to the constellation graphic and provide a text-based accessible fallback in a screen-reader-only `<div>`.
- **Admin panel 2FA**: The `prompt()` call for disabling 2FA is not accessible. Worth noting but out of scope for this task.
- **Framer Motion animations**: `motion.div` components may not announce dynamic content changes. This is a pre-existing concern — for now, animations are decorative.

### Per-Task Analysis

1. **Skip-to-content** — No skip link exists. Add a visually hidden link as the first focusable element in PortfolioPage (inside `<div className="min-h-screen bg-dark-base">` but before Navbar). Target `#main-content` on `<main>` element. Style it to appear on focus (Tailwind `sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]`). **Effort: ~0.5hr, affected files: PortfolioPage.tsx, index.css.**

2. **ARIA labels** — Only 4 `aria-*` uses across the entire frontend (hamburger toggle, 2x glitch ghosts, grid floor). Every interactive element needs labels: nav buttons (`aria-label="Ir a {section}"`), CTA buttons, social links (already have visible text but icons need labels for screen readers), brand link in navbar (convert from `<span>` to `<button>` with aria-label), admin panel tabs and action buttons, StarField canvas (`aria-hidden="true"`). **Effort: ~1hr, affected files: every component file.** Low complexity per element, just systematic.

3. **Color contrast** — Worst offenders: gray-500 (#6b7280, 4.09:1) on dark-bg fails AA for normal text; gray-600 (#4b5563, 2.61:1) fails everything. Simple fix: bump to gray-400 (#9ca3af, 7.78:1) and gray-500 respectively. Neon-purple at 4.30:1 fails AA normal but passes large text — acceptable for headings and brand, but avoid using it for body-size text. **Effort: ~0.5hr, affected files: tailwind.config.ts (optional), or update component styles directly.** Risk: losing some of the "dim" aesthetic for secondary text, but accessibility wins.

4. **Focus indicators** — Zero custom `:focus-visible` or `focus:ring` classes exist. Inputs in Contact.tsx and Login.tsx set `outline: 'none'` on focus with ONLY a box-shadow as replacement — but box-shadow alone may not be visible in high-contrast mode. Add `outline: '2px solid #00e5ff'` or `outline: '2px solid #b026ff'` + `outline-offset: '2px'` to the focus styles. Better: add a global `:focus-visible` rule in index.css. **Effort: ~0.25hr, affected files: index.css, Contact.tsx, Login.tsx.**

5. **Testing** — Frontend has zero test infrastructure. Backend has Vitest + supertest with 10 tests covering health, projects, analytics, contact, auth, and 404 handler. **Approach**: Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` to frontend devDependencies. Configure vitest in vite.config.ts. Write critical component tests: Navbar (renders links, mobile menu toggle), Contact form (validation states, submission), Hero (CTA buttons render, analytics hook fires). These 3 components cover the highest user impact. **Effort: ~1hr, affected files: frontend/package.json, frontend/vite.config.ts, plus new test files.**

### Ready for Proposal
Yes
