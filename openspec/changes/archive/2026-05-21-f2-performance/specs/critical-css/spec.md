# Delta for Critical CSS

## ADDED Requirements

### Requirement: Inline critical base styles

The `<head>` of `index.html` MUST contain an inline `<style>` block with critical above-the-fold styles to prevent Flash of Unstyled Content (FOUSC).

#### Scenario: Base styles applied before JS loads

- GIVEN the browser loads `index.html`
- WHEN the HTML is parsed before the JS/CSS bundles load
- THEN the page background is `#0a0a0f`, text color is `#e0e0e0`, and scroll-behavior is smooth
- AND no white flash occurs between HTML render and CSS bundle application

#### Scenario: No conflict with Tailwind output

- GIVEN the inline critical styles exist in `<head>`
- WHEN the main CSS bundle loads
- THEN there MUST be no conflicting property declarations
- AND the Tailwind CSS bundle overrides the inline styles without duplication warnings
