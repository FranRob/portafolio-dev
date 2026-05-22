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
