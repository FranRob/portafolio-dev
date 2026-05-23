# Delta for Admin Code Splitting

## ADDED Requirements

### Requirement: Login lazy-loading

Login component MUST be lazy-loaded via `React.lazy` so it is excluded from the main bundle and only fetched when navigating to `/admin/login`.

#### Scenario: Login loads on navigation

- GIVEN the user is on the portfolio page
- WHEN they navigate to `/admin/login`
- THEN the Login chunk is fetched and rendered
- AND a loading fallback is shown while the chunk loads

#### Scenario: Login not in main bundle

- GIVEN the initial page load of `/`
- WHEN the browser downloads the main JS bundle
- THEN the Login component code MUST NOT be present in that bundle

### Requirement: Admin tab code-splitting

Admin sub-components (AdminMessages, AdminProjects, AdminSettings) MUST each be lazy-loaded with individual `React.lazy` calls and `Suspense` boundaries inside `Dashboard.tsx`.

#### Scenario: Tab loads on first click

- GIVEN the admin is viewing the Metrics tab
- WHEN they click the "Mensajes" tab
- THEN the AdminMessages chunk is fetched and rendered
- AND other tab components are NOT fetched

#### Scenario: Rapid tab switching

- GIVEN the admin rapidly clicks between tabs (Mensajes → Proyectos → Ajustes)
- WHEN the clicks happen faster than chunk loading
- THEN only the last-requested tab's chunk is rendered
- AND no duplicate chunk requests occur

### Requirement: Dashboard lazy import cleanup

The existing `Dashboard` lazy import `.then(m => ({ default: m.default }))` SHALL be simplified to `import('./components/admin/Dashboard')`, since `Dashboard` already uses default export.

#### Scenario: Dashboard still loads correctly

- GIVEN the user navigates to `/admin/dashboard`
- WHEN the Dashboard lazy import resolves
- THEN the Dashboard component renders correctly without errors
