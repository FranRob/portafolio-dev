# Delta for Font Loading

## ADDED Requirements

### Requirement: Non-blocking Google Fonts CSS

The Google Fonts stylesheet in `index.html` MUST NOT block the critical rendering path. It SHALL use the `media="print" onload="this.media='all'"` pattern to load asynchronously.

#### Scenario: Font CSS loads without blocking

- GIVEN the browser requests `index.html`
- WHEN the parser encounters the Google Fonts `<link>` tag
- THEN the stylesheet is fetched asynchronously without blocking rendering
- AND fonts are applied after download completes

#### Scenario: Noscript fallback

- GIVEN the browser has JavaScript disabled
- WHEN the page loads
- THEN a `<noscript>` fallback `<link rel="stylesheet">` MUST provide the fonts

### Requirement: Existing font hints preserved

The `display=swap` parameter in the Google Fonts URL MUST remain unchanged. The preconnect hints (`fonts.googleapis.com`, `fonts.gstatic.com`) MUST remain unchanged.

#### Scenario: Font display fallback

- GIVEN the font files are still loading
- WHEN text is rendered
- THEN the browser uses the fallback font (`monospace` for body, `sans-serif` for headings)
- AND swaps to the web font once downloaded
