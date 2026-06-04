# testing-setup Specification

## Purpose

Define the frontend testing infrastructure requirements for portafolio-dev. Currently the frontend has zero tests — this spec establishes the baseline framework, conventions, and critical component test coverage.

## Requirements

### Requirement: Test Framework

The frontend testing setup MUST include Vitest as the test runner and jsdom as the DOM environment.

#### Scenario: Vitest configuration

- GIVEN the frontend project
- WHEN running `npm run test`
- THEN Vitest executes all `*.test.tsx` files under `src/`
- AND the environment uses jsdom for DOM APIs

#### Scenario: Build integration

- GIVEN a configured test setup
- WHEN running `npm run build`
- THEN tests SHALL NOT block the build (vitest is a separate script)

### Requirement: Testing Libraries

The test setup MUST include @testing-library/react for component rendering and @testing-library/jest-dom for DOM assertions.

#### Scenario: Render a React component

- GIVEN a React component
- WHEN rendered with `render(<Component />)` from @testing-library/react
- THEN the DOM output is available for assertions

#### Scenario: Jest DOM matchers

- GIVEN @testing-library/jest-dom is set up
- THEN custom matchers like `toBeInTheDocument()`, `toHaveTextContent()`, and `toHaveAttribute()` SHALL be available in tests

### Requirement: Critical Component Coverage

The test suite MUST cover at least 3 critical components: Navbar, Contact form, and Hero section.

#### Scenario: Navbar renders navigation links

- GIVEN a rendered Navbar component
- THEN navigation links for "Inicio", "Stack", "Proyectos", and "Contacto" SHALL be rendered
- AND the admin link SHALL be present in the DOM

#### Scenario: Navbar mobile toggle

- GIVEN the Navbar component
- WHEN the mobile menu toggle button is clicked
- THEN the mobile navigation menu SHALL become visible

#### Scenario: Contact form validation

- GIVEN the Contact form component
- WHEN the submit button is pressed with empty fields
- THEN validation error messages SHALL be displayed
- AND the form SHALL NOT submit

#### Scenario: Hero section CTAs

- GIVEN the Hero section component
- THEN CTA buttons with "Contactame" and "Ver Proyectos" SHALL be rendered
- AND the GlitchText component SHALL display the developer's name

### Requirement: Backend Test Helpers

The test suite MUST provide helper utilities for seeding data and authenticating in backend integration tests.

#### Scenario: seedAdmin creates admin user

- GIVEN a clean test database with migrations applied
- WHEN `seedAdmin()` is called
- THEN it returns `{ email, password, id }` matching `ADMIN_EMAIL` env var
- AND login with those credentials succeeds
- AND the function is idempotent (second call returns same `id`)

#### Scenario: getValidToken returns JWT

- GIVEN an admin user exists in the database
- WHEN `getValidToken()` is called
- THEN it returns a valid JWT string with `type: 'access'`, `id`, and `email`
- AND the token works for `GET /api/auth/me`
- AND `getValidToken({ includeCsrf: true })` returns `{ accessToken, csrfToken }`

#### Scenario: Data factories create test records

- GIVEN no projects exist
- WHEN `createTestProject(prisma)` is called
- THEN it returns a `Project` with default values (title, stack, status)
- AND `createTestMessage(prisma)` returns a `ContactMessage` with default values
- AND both accept `overrides` to customize fields

### Requirement: Backend Auth & Rate Limiting

The test suite MUST cover the full authentication flow including login, refresh tokens, logout, CSRF protection, and rate limiting.

#### Scenario: Login validation

- GIVEN the Express app is running with a test database
- WHEN POST `/api/auth/login` is called with valid credentials
- THEN it returns 200 with user info, accessToken in body, and cookies (csrf-token, accessToken, refreshToken)
- WHEN called with invalid email format
- THEN it returns 400
- WHEN called with wrong password
- THEN it returns 401 "Credenciales inválidas"
- WHEN called with non-existent email
- THEN it returns 401

#### Scenario: Refresh token flow

- GIVEN a valid login session
- WHEN POST `/api/auth/refresh` is called with the refresh token cookie and CSRF header
- THEN it returns 200 with a new accessToken
- WHEN the refresh token is revoked
- THEN it returns 401
- WHEN the refresh token is expired
- THEN it returns 401

#### Scenario: Logout

- GIVEN a valid authenticated session
- WHEN POST `/api/auth/logout` is called with proper CSRF headers
- THEN it returns 200 and clears auth cookies

#### Scenario: GET /auth/me

- GIVEN a valid access token
- WHEN GET `/api/auth/me` is called
- THEN it returns 200 with the admin user
- WHEN called without a token
- THEN it returns 401
- WHEN called with an invalid/expired token
- THEN it returns 401 with "expirado"

#### Scenario: CSRF protection

- WHEN a state-changing request (POST/PATCH/DELETE) is made without `x-csrf-token` header
- THEN it returns 403
- WHEN the CSRF token is mismatched
- THEN it returns 403
- WHEN a GET request is made without CSRF
- THEN it returns 200 (CSRF SHALL NOT block safe methods)

#### Scenario: Rate limiting on login

- GIVEN 5 failed login attempts for the same email
- WHEN a 6th attempt is made
- THEN it returns 429 "Cuenta bloqueada"
- WHEN 4 failures are followed by a successful login
- THEN the rate limit counter resets

### Requirement: Backend Admin CRUD

The test suite MUST cover authenticated CRUD operations on projects, contact messages, and analytics stats.

#### Scenario: Projects CRUD

- GIVEN an authenticated admin with CSRF headers
- WHEN POST `/api/projects` is called with valid data
- THEN it returns 201 and creates the project
- WHEN called with missing title or empty stack
- THEN it returns 400
- WHEN called without authentication
- THEN it returns 403 (CSRF)
- WHEN PATCH `/api/projects/:id` is called
- THEN it returns 200 with updated project
- WHEN the project does not exist
- THEN it returns 404
- WHEN DELETE `/api/projects/:id` is called
- THEN it returns 200 and the project disappears from GET list

#### Scenario: Contact Messages CRUD

- GIVEN an authenticated admin
- WHEN GET `/api/contact/messages` is called
- THEN it returns 200 with the messages list
- WHEN called without auth
- THEN it returns 401
- WHEN PATCH `/api/contact/:id/read` is called
- THEN it marks the message as read (200)
- WHEN PATCH `/api/contact/:id/unread` is called
- THEN it marks as unread
- WHEN PATCH `/api/contact/:id/category` is called with a category
- THEN it updates the category
- WHEN called on a non-existent message
- THEN it returns 404

#### Scenario: Analytics Stats

- GIVEN an authenticated admin
- WHEN GET `/api/analytics/stats` is called
- THEN it returns 200 with stats object
- WHEN called without auth
- THEN it returns 401
- WHEN there is no tracked data
- THEN it returns 200 with zero counts

### Requirement: Frontend Admin Component Tests

The test suite MUST cover the Login and Dashboard admin components with mocked API.

#### Scenario: Login component

- GIVEN the Login component is rendered
- THEN it SHALL render email input, password input, and submit button
- WHEN the form is submitted
- THEN it SHALL show "Verificando..." loading state
- WHEN login succeeds
- THEN it SHALL navigate to `/admin/dashboard`
- WHEN the API returns 401
- THEN it SHALL show "Email o contraseña incorrectos."
- WHEN the API returns 429
- THEN it SHALL show "Demasiados intentos. Esperá 15 minutos."
- WHEN there is a network error
- THEN it SHALL show "No hay conexión con el servidor."
- WHEN an unknown error occurs
- THEN it SHALL show the error message
- WHEN login is retried after a network error
- THEN it SHALL display retry count (1/3, 2/3)
- WHEN the user clicks "Volver al portfolio"
- THEN it navigates to home

#### Scenario: Dashboard component

- GIVEN the Dashboard component is rendered
- THEN it SHALL show a loading spinner initially
- WHEN data loads successfully
- THEN it SHALL render stat cards with totalVisits, todayVisits, etc.
- WHEN data has empty values
- THEN it SHALL display zero values or "Sin datos aún"
- WHEN the API fails
- THEN it SHALL show an error state
- WHEN a tab is clicked
- THEN it SHALL switch between Métricas, Mensajes, Proyectos, and Ajustes tabs
- WHEN a tab is selected
- THEN it SHALL persist the active tab to sessionStorage
- WHEN a logged-in user returns
- THEN it SHALL restore the active tab from sessionStorage
- WHEN the refresh button is clicked
- THEN it SHALL reload the stats data
- WHEN logout is clicked
- THEN it SHALL clear session and navigate to `/admin/login`
- WHEN "Portfolio" is clicked
- THEN it SHALL navigate to home
- WHEN using Suspense lazy tabs
- THEN a Suspense fallback SHALL be rendered while loading
