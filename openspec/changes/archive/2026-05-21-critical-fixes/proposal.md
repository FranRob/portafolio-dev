# Proposal: Critical Fixes

## Intent

Resolve 6 bugs across the full stack that break functionality, produce 404s, leak webpack-specific syntax, or ship mixed-language text. No new features — pure defect remediation.

## Scope

### In Scope
- Fix Docker healthcheck default user mismatch (already patched)
- Fix 2FA enable flow: save `secret` from setup, pass it to enable
- Create `frontend/public/` with SVG favicon to fix 404
- Fix `ContactMessage.category` default from `"leido"` to `"no-leido"`
- Fix Spanish/English mixed text in admin settings
- Remove `webpackPrefetch` comment from dynamic import in Footer

### Out of Scope
- Feature additions or UI redesign
- Adding tests for the fixed components
- Database migration automation (migration step noted, not automated)

## Capabilities

### New Capabilities
None — all fixes are bug patches, no new external behaviors.

### Modified Capabilities
None — no spec-level behavioral contract changes (schema default is implementation detail).

## Approach

| Bug | Fix | Risk |
|-----|-----|------|
| Docker user mismatch | Already fixed: `portafolio-dev` → `portafolio` | None |
| 2FA secret discarded | Add `secret` state, save from `setupTwoFactor()`, pass to `enableTwoFactor(code, secret)` | Low |
| Missing `public/` → 404 | Create `frontend/public/` with inline SVG favicon | None |
| Category default wrong | Change `@default("leido")` → `@default("no-leido")` + `prisma migrate dev` | Low |
| Mixed language text | Replace `"periodically"` → `"periódicamente"` | None |
| webpackPrefetch in Vite | Remove `/* webpackPrefetch: true */` comment | None |

Fixes applied in parallel where independent (all are).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docker-compose.yml` | Modified | Default user already corrected |
| `frontend/src/components/admin/AdminSettings.tsx` | Modified | Add `secret` state, fix 2FA flow, fix mixed text |
| `frontend/public/vite.svg` | Created | New favicon asset |
| `backend/prisma/schema.prisma` | Modified | Category default string changed |
| `frontend/src/components/layout/Footer.tsx` | Modified | Remove webpack comment |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 2FA still broken if `setupTwoFactor()` API returns different shape | Low | Verify response shape before coding |
| Migration conflicts with existing data | Low | `prisma migrate dev` handles safely |

## Rollback Plan

- All changes are small and localized. Rollback per file via `git checkout` (none touch shared contracts).
- Schema change: revert the default string and run `prisma migrate dev` again.
- No data migration scripts needed — default only applies to new rows.

## Dependencies

None.

## Success Criteria

- [ ] `docker compose up` healthcheck passes on first attempt
- [ ] 2FA enable flow works end-to-end (setup → scan → verify code)
- [ ] `GET /vite.svg` returns 200, not 404
- [ ] New contact messages default to `"no-leido"`
- [ ] "Actualizá tu contraseña periódicamente" renders fully in Spanish
- [ ] Vite build succeeds without warnings about webpack comments
