# Tasks: Mobile & W3C Compliance

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80-120 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Mobile fixes + Safari CSS + W3C check | PR 1 | All CSS/sizing changes, single cohesive scope |

## Phase 1: Core Mobile Fixes (iOS + touch targets)

- [x] 1.1 Contact.tsx — change input fontSize from '13px' to '16px' in inputStyle (prevents iOS zoom on focus)
- [x] 1.2 Login.tsx — change input fontSize from '13px' to '16px' in inputStyle (prevents iOS zoom on focus)
- [x] 1.3 Navbar.tsx — hamburger button: add min-w-[44px] min-h-[44px] flex items-center justify-center; mobile links: py-1→py-2
- [x] 1.4 Hero.tsx — CTA buttons already have py-3 (verified, no change needed)
- [x] 1.5 Footer.tsx — add px-3 py-2 rounded to admin link for touch target sizing

## Phase 2: Admin Touch Targets

- [x] 2.1 Dashboard.tsx — add min-h-[44px] to header action buttons (Refresh, Portfolio, Logout) and tab bar buttons
- [x] 2.2 AdminProjects.tsx — add min-h-[44px] to Cancel, Guardar, + Nuevo Proyecto, Editar, Eliminar buttons; reorder arrows min-h-[32px]; list row py-3
- [x] 2.3 AdminMessages.tsx — add min-h-[44px] to tab buttons, action buttons (mark read/unread, move, delete), add category buttons
- [x] 2.4 AdminSettings.tsx — add min-h-[44px] to 2FA enable/disable/configure buttons and password change/cancel buttons

## Phase 3: Safari CSS Polish

- [x] 3.1 ProjectCard.tsx — replace manual WebkitLineClamp inline style with Tailwind `line-clamp-3` class
- [x] 3.2 index.css — add -webkit-font-smoothing: antialiased to body; appearance: none on inputs/selects/textarea; scrollbar-width: thin for Firefox

## Phase 4: W3C Validation

- [x] 4.1 Run production build and verify dist/index.html for W3C compliance (inspect only, no code changes expected)
