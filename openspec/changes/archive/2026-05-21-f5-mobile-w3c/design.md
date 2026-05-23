# Design: F5 — Mobile & W3C

## Technical Approach

Five independent CSS/sizing/config fixes across 12 frontend files. No behavioral changes, no new dependencies. Single PR under 150 lines.

## Architecture Decisions

### Decision: Input font-size 13px → 16px
| Option | Tradeoff |
|--------|----------|
| Leave 13px | iOS Safari auto-zooms on focus (known quirk: inputs < 16px trigger zoom) |
| **Change to 16px** (chosen) | Solves iOS zoom. No padding compensation needed — 16px is the standard. Minimal visual diff on desktop. |

**Rationale**: iOS Safari will zoom into any `<input>` with `font-size < 16px` when focused. The fix is to change the `fontSize` property in the inline style objects. Both `Contact.tsx` and `Login.tsx` define a shared `inputStyle` object — single edit per file.

### Decision: Touch targets via Tailwind utilities
| Option | Tradeoff |
|--------|----------|
| Arbitrary CSS values | Inconsistent with codebase conventions |
| **Tailwind min-h/min-w/padding** (chosen) | Consistent with existing classes. No custom CSS needed. |

**Rationale**: Use `min-w-[44px] min-h-[44px]` for the hamburger, and `py-2` / `py-1.5` → `py-2` / `min-h-[44px]` additions for buttons. WCAG 2.5.8 (Target Size) recommends 44x44 minimum.

### Decision: `line-clamp-3` over `-webkit-line-clamp`
| Option | Tradeoff |
|--------|----------|
| Keep manual webkit CSS | Fragile, no overflow fallback |
| **line-clamp-3** (chosen) | Tailwind compiles to same webkit props with standard `overflow: hidden` fallback |

**Rationale**: Maintainable, smaller CSS, equivalent rendering in all target browsers.

### Decision: Single PR for all 5 deliverables
| Option | Tradeoff |
|--------|----------|
| Split into multiple PRs | Context-switching between PRs touching the same files |
| **Single PR** (chosen) | ~100 lines changed, zero risk, one review pass |

**Rationale**: All changes are trivial and independent. 400-line budget is not a concern.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/components/sections/Contact.tsx` | Modify | `fontSize: '13px'` → `'16px'` in `inputStyle` (line 84) |
| `frontend/src/components/admin/Login.tsx` | Modify | `fontSize: '13px'` → `'16px'` in `inputStyle` (line 92) |
| `frontend/src/components/layout/Navbar.tsx` | Modify | Hamburger: add `min-w-[44px] min-h-[44px] flex items-center justify-center` (line 98). Mobile nav links: `py-1` → `py-2` (line 119) |
| `frontend/src/components/sections/Hero.tsx` | Modify | CTA buttons: `px-4 sm:px-8` → `px-6 sm:px-8` (lines 114, 135) |
| `frontend/src/components/sections/ProjectCard.tsx` | Modify | Replace inline WebkitLineClamp (lines 102-106) with `className="line-clamp-3"` on the `<p>` tag |
| `frontend/src/components/admin/Dashboard.tsx` | Modify | Header buttons `px-3 py-2` → `px-4 py-2` (lines 125, 135, 146). Add `min-h-[44px]` to tab buttons (line 169) |
| `frontend/src/components/admin/AdminProjects.tsx` | Modify | Action buttons (Editar/Eliminar): `px-3 py-1` → `px-4 py-2` (lines 514, 526). New project button: `px-4 py-2` → `px-5 py-2.5` (line 394) |
| `frontend/src/components/admin/AdminMessages.tsx` | Modify | Action buttons: `px-3 py-1.5` → `px-4 py-2` (lines 247, 255, 268, 297) |
| `frontend/src/components/admin/AdminSettings.tsx` | Modify | All buttons: add `min-h-[44px]` where `py-2` is used (already `px-4 py-2` — size is marginal) |
| `frontend/src/components/layout/Footer.tsx` | Modify | Admin link: add `px-3 py-2` to increase hit area (line 36) |
| `frontend/src/index.css` | Modify | Add `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale` to `body`. Add `scrollbar-width: thin` alongside `::-webkit-scrollbar`. Add `appearance: none` to `input, button, textarea` reset inside `@layer base` |
| `frontend/index.html` | Validate | Run `dist/index.html` through W3C Nu checker (likely no changes needed) |

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Build | TypeScript + Vite | `npm run build` in `frontend/` |
| Visual | Responsive viewport | Chrome DevTools iPhone 12/SE viewports — check no layout shifts |
| W3C | HTML validation | Built `dist/index.html` via validator.w3.org/nu |

No new automated tests — CSS-only changes with no behavior modification.

## Open Questions

- None. All changes are mechanical and direct.

## Review Workload Forecast

- **Lines changed**: ~100 (within 400-line budget)
- **Decision needed before apply**: No
- **Chained PRs recommended**: No
- **400-line budget risk**: Low
