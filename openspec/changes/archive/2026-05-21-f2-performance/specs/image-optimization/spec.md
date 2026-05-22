# Delta for Image Optimization

## ADDED Requirements

### Requirement: Native lazy loading on project images

Every `<img>` tag rendering project images (`project.imageUrl`) in `ProjectCard.tsx` MUST include `loading="lazy"` to defer offscreen image loading.

#### Scenario: Offscreen image defers load

- GIVEN a project card is below the viewport
- WHEN the page initially loads
- THEN the image's `loading="lazy"` attribute defers its fetch until the card scrolls near the viewport

#### Scenario: Image loads when scrolled into view

- GIVEN a project card is below the viewport
- WHEN the user scrolls the card within close range of the viewport
- THEN the browser fetches and renders the image

### Requirement: Explicit image dimensions

Every `<img>` tag in `ProjectCard.tsx` MUST include explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS).

#### Scenario: Layout stable before image loads

- GIVEN a project card with `project.imageUrl`
- WHEN the browser renders the card before the image finishes loading
- THEN the image placeholder occupies the correct dimensions (full width, 128-176px height)
- AND no layout shift occurs when the image eventually loads

#### Scenario: Fallback initials when no image

- GIVEN a project card without `project.imageUrl`
- WHEN the card renders
- THEN the initials fallback is displayed inside the same dimensions
- AND no `loading="lazy"` or dimension attributes are needed (no `<img>` tag rendered)
