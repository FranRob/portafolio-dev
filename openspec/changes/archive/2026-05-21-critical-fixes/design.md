# Design: Critical Fixes

## Technical Approach

Six independent, single-responsibility bug fixes across the full stack. No shared infrastructure, no new contracts, no cascading changes. Each fix is localized to one file with a change size of 1–5 lines. The Docker healthcheck (F-1) is already fixed and only documented.

## Fixes

### F-1: Docker Healthcheck User Mismatch (Already Fixed)

| Property | Value |
|----------|-------|
| **Status** | ✅ Complete |
| **File** | `docker-compose.yml` (line 14) |
| **Fix** | `pg_isready -U portafolio-dev` → `pg_isready -U ${POSTGRES_USER:-portafolio}` |
| **Technical decision** | Uses env var with fallback matching `POSTGRES_USER`. Already deployed. |

### F-2: 2FA Secret Discarded in Enable Flow

| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/admin/AdminSettings.tsx` |
| **Changes** | 2 additions, 2 modifications |
| **What** | Add `secret` state variable (line 38). In `handleSetup()` (line 66), save `data.secret` alongside `data.qrCode`. In `handleEnable()` (line 84), pass `enableTwoFactor(code, secret)` instead of `enableTwoFactor(code, '')`. |
| **Rationale** | The `TwoFactorSetup` API response includes `secret` and `qrCode`. The code was discarding `secret`, so `enableTwoFactor` received an empty string and the backend could not verify the TOTP code against the correct secret. |
| **Risk** | Low. If the API response shape changes, TypeScript catches it at compile time via the `TwoFactorSetup` interface. |

### F-3: Missing `public/` Directory — 404 on `/vite.svg`

| Property | Value |
|----------|-------|
| **File** | `frontend/public/vite.svg` (create) |
| **Changes** | 1 new file |
| **What** | Create `frontend/public/` directory with a neon-purple SVG favicon matching brand identity (`#b026ff`). |
| **Rationale** | `index.html` references `<link rel="icon" href="/vite.svg">`. Vite serves static assets from `public/`. Without the file, every page load produces a 404. |
| **Risk** | None. Static asset, no code changes. |

### F-4: ContactMessage Category Default

| Property | Value |
|----------|-------|
| **File** | `backend/prisma/schema.prisma` (line 79) |
| **Changes** | 1 modification |
| **What** | Change `@default("leido")` → `@default("no-leido")`. Run `npx prisma migrate dev --name fix_contact_category_default`. |
| **Rationale** | New contact messages should default to "no-leido" (unread) so they appear in the admin dashboard. The previous default "leido" (read) caused new messages to be hidden from unread filters. |
| **Tradeoff** | Default-only change — does NOT update existing rows. This is intentional: existing messages keep their category. Migration command is documented, not automated. |
| **Risk** | Low. Affects only new rows. Existing data untouched. |

### F-5: English/Spanish Mixed Text

| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/admin/AdminSettings.tsx` (line 318) |
| **Changes** | 1 modification |
| **What** | Replace `"periodically"` → `"periódicamente"` in the password hint string. |
| **Rationale** | The rest of the UI is in Spanish. One English word leaked in. |
| **Risk** | None. String-only change. |

### F-6: webpackPrefetch Comment in Vite Build

| Property | Value |
|----------|-------|
| **File** | `frontend/src/components/layout/Footer.tsx` (line 34) |
| **Changes** | 1 modification |
| **What** | Remove `/* webpackPrefetch: true */` from the dynamic import comment. Keep `import('../../components/admin/Dashboard')`. |
| **Rationale** | Vite does not support webpack-specific magic comments. The comment causes build warnings and is silently ignored. Dynamic import behavior is unaffected. |
| **Risk** | None. The import itself remains; only the webpack-specific comment is removed. |

## File Changes Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `docker-compose.yml` | Already fixed | 0 |
| `frontend/src/components/admin/AdminSettings.tsx` | Modify | 4 |
| `frontend/public/vite.svg` | Create | 1 new file |
| `backend/prisma/schema.prisma` | Modify | 1 |
| `frontend/src/components/layout/Footer.tsx` | Modify | 1 |

## Architecture Decisions

No architecture decisions required. All fixes are localized patches with no shared contracts, no data flow changes, and no architectural impact. The Prisma schema change (F-4) is the only one that touches the data layer, and it's a default-only change that does not alter the schema structure.

## Testing Strategy

| Fix | Verification |
|-----|-------------|
| F-2 | Manual: setup → scan QR → enter code → enable 2FA succeeds |
| F-3 | Browser: `GET /vite.svg` returns 200 |
| F-4 | Seed new contact → check `category` is `"no-leido"` |
| F-5 | Visual: password hint reads fully in Spanish |
| F-6 | Build: `npm run build` produces no webpack warnings |

No automated tests added (explicitly out of scope).

## Migration

F-4 requires a Prisma migration. Run after schema change:

```bash
cd backend
npx prisma migrate dev --name fix_contact_category_default
```

No rollback needed for other fixes — revert individual files via `git checkout`.

## Open Questions

None. All fixes are well-understood and independently verifiable.
