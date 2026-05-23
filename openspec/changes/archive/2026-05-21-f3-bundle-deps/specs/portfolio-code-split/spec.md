# Delta for Portfolio Code Split

## ADDED Requirements

### Requirement: PortfolioPage MUST be lazy-loaded

The `PortfolioPage` component and all its section sub-components MUST be lazy-loaded to defer framer-motion and section code from the initial bundle.

#### Scenario: PortfolioPage loads on navigation to `/`

- GIVEN the user navigates to the root URL `/`
- WHEN the main bundle loads and renders `<App />`
- THEN `PortfolioPage` is fetched as a separate chunk
- AND a loading fallback is shown while the chunk loads
- AND framer-motion is NOT present in the initial main bundle

#### Scenario: Section animations work after load

- GIVEN the `PortfolioPage` chunk has loaded
- WHEN the user scrolls through the page
- THEN all `motion.div` animations render correctly
- AND framer-motion is loaded as part of the PortfolioPage chunk

### Requirement: Admin route unaffected

The admin panel code-splitting from F2 MUST remain intact. The admin route MUST NOT be affected by the PortfolioPage lazy loading.

#### Scenario: Admin dashboard works as before

- GIVEN the admin navigates to `/admin/dashboard`
- WHEN the Dashboard lazy chunk loads
- THEN it renders correctly
- AND the PortfolioPage chunk is NOT fetched
