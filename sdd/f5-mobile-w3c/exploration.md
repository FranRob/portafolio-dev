## Exploration: F5 — Mobile & W3C

### Current State

#### Task 20 — W3C HTML Validation
**State: Mostly clean, no critical issues found.**
The `frontend/index.html` is well-structured:
- `<!DOCTYPE html>` ✓
- `<html lang="es">` ✓
- `<meta charset="UTF-8">` ✓
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` ✓
- `<title>divMalCentrado | Dev Portfolio</title>` ✓
- `<meta name="description">` and `<meta name="author">` ✓
- Complete Open Graph and Twitter Card meta tags ✓
- Font loading uses `media="print"` + `onload` pattern with `<noscript>` fallback ✓
- `<script type="module">` ✓
- No duplicate IDs, no deprecated attributes, no unclosed tags
- The only minor concern: `onload="this.media='all'"` on the font `<link>` is a well-known pattern but some validators may flag inline JS in attributes.

The built output by Vite would inject `<script type="module">` tags with hashed names. This is standard and valid.

#### Task 21 — Mobile Friendly
**State: 2 blocking issues, 3 moderate issues.**

✅ **Viewport**: Correct `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

❌ **Input font size (13px)** — CRITICAL. Both `Contact.tsx` and `Login.tsx` set `fontSize: '13px'` on form inputs. On iOS Safari, inputs with `font-size < 16px` trigger auto-zoom when focused. This is one of the most common mobile UX pitfalls.

❌ **Mobile hamburger button** — The Navbar's mobile menu toggle uses `p-1` (4px padding) with `size={22}` icon. Total touch target: ~30x30px. WCAG Success Criterion 2.5.8 (Target Size) and Apple HIG recommend **minimum 44x44px** for touch targets.

❌ **Mobile nav links** — Use `py-1` (4px vertical padding). With font-size ~14px, each link height is ~22px — well below 44px.

⚠️ **Hero CTA buttons** — At `py-3` (12px padding) + font-size ~14px, height is ~38px. Below 44px on mobile, but close.

⚠️ **Admin buttons** — Many admin action buttons use `py-2` (8px padding) or `py-1` (4px), making them hard to tap accurately on mobile.

✅ **Responsive layout**: Tailwind breakpoints are the defaults (sm:640px, md:768px, lg:1024px). Sections use `grid-cols-1` on mobile → multi-column on desktop. No horizontal scroll present (`overflow-x: hidden` on html/body).

#### Task 22 — Safari Fallbacks
**State: Good foundation, minor gaps.**

✅ **`backdrop-filter`**: Both `backdropFilter: 'blur(12px)'` and `WebkitBackdropFilter: 'blur(12px)'` present in Navbar and Dashboard header. ✓

✅ **`mask-image`**: Both `maskImage` and `WebkitMaskImage` present in Hero's synthwave grid. ✓

⚠️ **Custom scrollbar** (`index.css`): Uses `::-webkit-scrollbar` pseudoelements. This works on Safari but has NO standard `scrollbar-width`/`scrollbar-color` fallback. Currently only `-webkit-` prefixed.

⚠️ **`-webkit-line-clamp`** (ProjectCard.tsx): Uses `display: -webkit-box`, `WebkitLineClamp: 3`, `WebkitBoxOrient: 'vertical'` — these are WebKit-only properties. No standard `line-clamp` from Tailwind used. Could use `line-clamp-3` utility.

⚠️ **No `-webkit-font-smoothing`**: Not set anywhere. Good practice to add `-webkit-font-smoothing: antialiased` for sharper text rendering on macOS Safari.

⚠️ **No `appearance: none`** on form inputs: Safari renders inputs with default OS styling. Adding `appearance: none` to custom-styled inputs ensures consistency.

✅ **Autoprefixer**: Configured in `postcss.config.js` — handles CSS files. Does NOT process inline JSX styles.

### Affected Areas

- `frontend/index.html` — Could add `<meta http-equiv="X-UA-Compatible">` for IE edge mode (low priority)
- `frontend/src/components/sections/Contact.tsx` — Lines 84: fontSize 13px → must be ≥ 16px; touch targets for inputs need larger padding
- `frontend/src/components/admin/Login.tsx` — Line 92: fontSize 13px → must be ≥ 16px; touch targets need larger padding
- `frontend/src/components/layout/Navbar.tsx` — Mobile hamburger button (line 98: `p-1`), mobile nav link padding (line 119: `py-1`)
- `frontend/src/components/sections/Hero.tsx` — CTA button touch targets (`py-3` ~38px)
- `frontend/src/components/sections/ProjectCard.tsx` — Replace WebkitLineClamp with Tailwind `line-clamp-3`
- `frontend/src/index.css` — Add `scrollbar-width`/`scrollbar-color` fallback; add `-webkit-font-smoothing: antialiased` on body
- `frontend/src/components/admin/Dashboard.tsx` — Admin button touch targets
- `frontend/src/components/admin/AdminProjects.tsx` — Small action buttons
- `frontend/src/components/admin/AdminMessages.tsx` — Small action buttons
- `frontend/src/components/admin/AdminSettings.tsx` — Small action buttons
- `frontend/src/components/layout/Footer.tsx` — Tiny admin link (~20x20px)

### Approaches

1. **Full sweep (recommended)** — Fix all 3 tasks in a single pass. Tackle the input font-size issue first (highest impact on mobile UX), then touch targets, then Safari polish.
   - Pros: Cohesive change, one review cycle, all issues fixed together
   - Cons: Touches many files, needs testing across browsers
   - Effort: Medium (1-2 hrs per the ROADMAP estimate)

2. **Split by task** — Do W3C validation first, then Mobile, then Safari separately in chained PRs.
   - Pros: Smaller diffs, easier to review
   - Cons: Churn from updating same files multiple times (e.g., index.css appears in both W3C and Safari tasks)
   - Effort: Low per slice, more total overhead

### Recommendation

**Approach 1 (full sweep)** — The tasks overlap in files (index.css, Contact.tsx, Navbar.tsx). A single focused pass avoids touching the same files 3 times. Priority order:
1. FIX **`font-size: 13px` → `16px`** on all form inputs (Contact + Login) — this is a real usability bug on iOS.
2. FIX **touch targets** — Hamburger button, mobile nav links, CTA buttons, admin buttons.
3. ADD **Safari polish** — `-webkit-font-smoothing`, `appearance: none` on inputs, `line-clamp-3` utility.
4. ADD **scrollbar fallback** for Firefox compatibility while we're in index.css.

### Risks

- **Input font-size change** (13px → 16px) will alter the visual proportions of the form. The design may need slight padding adjustments to compensate.
- **Touch target changes** (increasing padding) on Navbar may shift layout. Need to check that the mobile menu still looks right.
- **Safari scrollbar changes**: Adding `scrollbar-width: thin` (Firefox property) has no effect on Safari but should be tested.

### Per-Task Analysis

1. **W3C HTML**: Already clean. No errors found in source. Run the built output through W3C Nu HTML Checker if we want to be thorough, but the expected effort is nearly zero. **Recommendation**: Validate once on the built output, but don't spend time here.

2. **Mobile Friendly**: **This is where the real work is.** Input font-size is a confirmed iOS bug. Touch targets across Navbar, CTAs, and admin panel need padding increases. **Recommendation**: Fix the iOS input zoom bug first (highest user impact), then touch targets across all interactive elements.

3. **Safari**: Good foundation. `backdrop-filter` and `mask-image` already have WebKit fallbacks. Add `-webkit-font-smoothing` on body, replace inline `-webkit-line-clamp` with Tailwind `line-clamp-3`, add `scrollbar-width` CSS property, and add `appearance: none` on form inputs. **Recommendation**: Quick wins, spread out across the touch target fixes.

### Ready for Proposal

Yes
