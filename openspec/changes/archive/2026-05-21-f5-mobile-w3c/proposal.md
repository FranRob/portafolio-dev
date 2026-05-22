# Proposal: F5 — Mobile & W3C

## Intent

Polish mobile friendly and Safari compatibility. Fix iOS input zoom bug (13px inputs), undersized touch targets, and Safari-specific CSS gaps. No new features.

## Scope

### In Scope
- Validate built `dist/index.html` passes W3C
- Fix iOS zoom: Contact.tsx, Login.tsx inputs 13px → 16px
- Touch targets: hamburger 44x44, nav `py-1`→`py-2`, CTA `py-3`, admin buttons/footer link padding
- Safari: `-webkit-font-smoothing` on body, `appearance: none` on inputs, replace `WebkitLineClamp` with `line-clamp-3`, add `scrollbar-width: thin`
- Build succeeds, no desktop regressions

### Out of Scope
Full responsive redesign, PWA, service workers, Safari JS workarounds (e.g. deprecated `-webkit-overflow-scrolling`)

## Capabilities

### New Capabilities
None — no new spec-level behavior.

### Modified Capabilities
None — pure implementation polish, no requirement changes.

## Approach

1. Run `npx vite build`, validate `dist/index.html` via W3C checker
2. Change `fontSize: '13px'` → `fontSize: '16px'` in Contact.tsx, Login.tsx
3. Bump touch targets: hamburger `w-8 h-8`→`w-11 h-11`, nav `py-1`→`py-2`, CTA `px-8 py-3`, admin buttons `px-3 py-1.5`→`px-4 py-2`, footer link padding
4. Add CSS: `-webkit-font-smoothing: antialiased` on body, `appearance: none` on inputs, `.line-clamp-3` replacing inline `WebkitLineClamp`, `scrollbar-width: thin`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| Contact.tsx | Modified | Input font 13→16px |
| Login.tsx | Modified | Input font 13→16px |
| Navbar.tsx | Modified | Hamburger 44x44, nav link py |
| Hero.tsx | Modified | CTA button py padding |
| ProjectCard.tsx | Modified | line-clamp class |
| Dashboard.tsx | Modified | Button padding |
| Admin*.tsx (3 files) | Modified | Button padding |
| Footer.tsx | Modified | Admin link padding |
| index.css | Modified | Safari CSS tweaks |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 13→16px changes form proportions | Low | Visual check on desktop |
| Touch padding shifts mobile layout | Low | Test mobile viewport |
| Scrollbar-width Firefox-only | None | No-op on Chrome/Safari |

## Rollback Plan

Revert each file individually via `git checkout -- <file>`. No migration or config involved.

## Dependencies

None.

## Success Criteria

- [ ] W3C HTML validation passes on built output
- [ ] No input font-size < 16px in JSX (iOS zoom fix)
- [ ] All interactive elements ≥ 44x44px touch target on mobile
- [ ] Build succeeds
- [ ] No visual regressions on desktop
