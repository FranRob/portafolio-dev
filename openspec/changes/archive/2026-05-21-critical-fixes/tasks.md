# Tasks — critical-fixes

## Overview

6 bug fixes, all independent. Execution order is free — no dependencies between tasks.

## Task List

### T-1 ✅ Docker healthcheck default user mismatch
- **Status**: COMPLETED (applied before SDD pipeline)
- **File**: `docker-compose.yml`
- **Action**: modified
- **Change**: `${POSTGRES_USER:-portafolio-dev}` → `${POSTGRES_USER:-portafolio}`
- **Verification**: `docker compose config` shows `portafolio` as default user

---

### T-2 🔲 Fix 2FA enable flow
- **File**: `frontend/src/components/admin/AdminSettings.tsx`
- **Action**: modify
- **Changes**:
  1. Add state: `const [secret, setSecret] = useState('')`
  2. In `handleSetup()`: add `setSecret(data.secret)` after `setQrCode(data.qrCode)`
  3. In `handleEnable()`: change `enableTwoFactor(code, '')` to `enableTwoFactor(code, secret)`
- **Verification**: Admin panel → Settings → Configurar 2FA → escanear QR → ingresar código → habilita sin error

---

### T-3 🔲 Create public/ directory with favicon
- **Create**: `frontend/public/vite.svg`
- **Action**: create directory + file
- **Content**: Neon-purple SVG icon (#b026ff) — minimal terminal/bracket symbol matching brand
- **Verification**: `http://localhost:5173/vite.svg` returns the SVG, no 404 in console

---

### T-4 🔲 Fix ContactMessage category default
- **File**: `backend/prisma/schema.prisma` (line 79)
- **Action**: modify + run migration
- **Change**: `@default("leido")` → `@default("no-leido")`
- **Command**: `npx prisma migrate dev --name fix_contact_category_default`
- **Verification**: New ContactMessage has `category: "no-leido"` by default. Existing records unchanged.

---

### T-5 🔲 Fix English/Spanish typo
- **File**: `frontend/src/components/admin/AdminSettings.tsx` (line 318)
- **Action**: modify
- **Change**: `"periodically"` → `"periódicamente"`
- **Verification**: Settings page shows "periódicamente" correctly

---

### T-6 🔲 Remove webpackPrefetch comment
- **File**: `frontend/src/components/layout/Footer.tsx` (line 34)
- **Action**: modify
- **Change**: Remove `/* webpackPrefetch: true */` from dynamic import
- **Verification**: Footer compiles without warnings, dynamic import still works (Dashboard prefetch on hover)
