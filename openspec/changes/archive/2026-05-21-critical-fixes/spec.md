# Critical Fixes — Specification

## Scope Boundary

Explicitly NOT in scope:
- Feature additions or UI redesign
- Adding automated tests for fixed components
- Database migration automation (migration command is documented, not scripted)
- Any changes beyond the six defects listed below

## Requirements

### F-1: Docker Healthcheck Default User

| Property | Value |
|---|---|
| **Type** | Already Fixed |
| **File** | `docker-compose.yml` (line 14) |
| **Requirement** | The healthcheck `pg_isready -U` MUST use the same default user as `POSTGRES_USER`. |

**Status**: ✅ Complete. Uses `${POSTGRES_USER:-portafolio}`. No action required.

### F-2: 2FA Enable Flow — Secret Discarded

| Property | Value |
|---|---|
| **Type** | Bug Fix |
| **File** | `frontend/src/components/admin/AdminSettings.tsx` (lines 62–94) |
| **Requirement** | The component MUST preserve the `secret` from `setupTwoFactor()` response and MUST pass it to `enableTwoFactor(code, secret)`. |

**Root cause**: `handleSetup()` saves `data.qrCode` but discards `data.secret`. `handleEnable()` passes `enableTwoFactor(code, '')`.

#### Scenario: Happy path — full setup→enable cycle
- GIVEN the admin is on Security Settings with 2FA disabled
- WHEN they click "Configurar 2FA"
- THEN `setupTwoFactor()` is called and the returned `secret` is saved to state
- AND the QR code is displayed
- WHEN they enter a valid 6-digit code and click "Habilitar"
- THEN `enableTwoFactor(code, secret)` is called with the stored secret
- AND 2FA is enabled with success message "2FA habilitado"

#### Scenario: Edge case — empty code
- GIVEN the QR code is displayed
- WHEN "Habilitar" is clicked with empty input
- THEN error "Ingresá el código de tu app autenticadora" is shown
- AND `enableTwoFactor` is NOT called

### F-3: Missing `public/` — 404 on `/vite.svg`

| Property | Value |
|---|---|
| **Type** | Bug Fix |
| **File** | `frontend/index.html` (line 5); needs `frontend/public/vite.svg` |
| **Requirement** | `frontend/public/vite.svg` MUST exist so the favicon link in `index.html` resolves without 404. |

#### Scenario: Happy path — favicon serves
- GIVEN the Vite dev server or production build is running
- WHEN a browser requests `GET /vite.svg`
- THEN the response is 200 with MIME type `image/svg+xml`

#### Scenario: Edge case — directory doesn't exist
- GIVEN `frontend/public/` does not exist
- WHEN Vite starts or builds
- THEN `/vite.svg` returns 404 (the defect being fixed)

### F-4: ContactMessage Category Default — Wrong Initial Value

| Property | Value |
|---|---|
| **Type** | Bug Fix |
| **File** | `backend/prisma/schema.prisma` (line 79) |
| **Requirement** | New `ContactMessage` rows MUST have `category` default to `"no-leido"`, not `"leido"`. |

#### Scenario: Happy path — new message is unread
- GIVEN a visitor submits the contact form
- WHEN a new `ContactMessage` is persisted
- THEN `category` defaults to `"no-leido"`
- AND the admin dashboard filters it as unread

**Data note**: Default applies to NEW rows only. Existing records are unaffected. Requires `prisma migrate dev`.

### F-5: Mixed-Language Text — English Fragment in Spanish UI

| Property | Value |
|---|---|
| **Type** | Bug Fix |
| **File** | `frontend/src/components/admin/AdminSettings.tsx` (line 318) |
| **Requirement** | The password hint text MUST be fully Spanish. Replace `"periodically"` → `"periódicamente"`. |

#### Scenario: Happy path — fully Spanish rendering
- GIVEN the admin views Security Settings
- WHEN the password change section renders
- THEN the hint reads `"Actualizá tu contraseña periódicamente"` with zero English words

#### Scenario: Regression — no other English strings introduced
- GIVEN the fix is applied
- WHEN the entire file is scanned for English-only strings
- THEN no other English text fragments exist alongside Spanish text (all other text in file is already Spanish)

### F-6: webpackPrefetch Comment in Vite Build

| Property | Value |
|---|---|
| **Type** | Bug Fix |
| **File** | `frontend/src/components/layout/Footer.tsx` (line 34) |
| **Requirement** | The dynamic import MUST NOT contain webpack-specific `/* webpackPrefetch: true */` comment. Vite does not support it. |

#### Scenario: Happy path — clean build
- GIVEN `npm run build` is executed (Vite)
- WHEN the build completes
- THEN no warnings about unknown webpack comments appear
- AND the dynamic import of `Dashboard` still works on hover

#### Scenario: Edge case — hover still triggers prefetch
- GIVEN the fix is applied
- WHEN the user hovers over the admin button
- THEN the `Dashboard` chunk is still dynamically imported
- AND no console errors occur

## Delivery Risk

| Risk | Likelihood | Mitigation |
|---|---|---|
| 2FA still broken if `setupTwoFactor()` response shape differs from `TwoFactorSetup` | Low | Code was verified against current API |
| Migration conflicts with existing rows | Low | Default-only change, existing rows unaffected |
| Total change exceeds 400-line review budget | Low | All fixes are 1-5 line changes; each is independent and reviewable separately |
