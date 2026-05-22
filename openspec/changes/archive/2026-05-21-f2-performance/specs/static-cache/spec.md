# Delta for Static Cache

## ADDED Requirements

### Requirement: WebP and AVIF in cache regex

The nginx location regex for static assets MUST include `webp` and `avif` file extensions alongside existing types.

#### Scenario: WebP images served with cache

- GIVEN a request to `/assets/image.webp`
- WHEN nginx processes the request
- THEN it matches the static cache location block
- AND responds with `Cache-Control: public, immutable` and `expires 1y`

#### Scenario: AVIF images served with cache

- GIVEN a request to `/assets/image.avif`
- WHEN nginx processes the request
- THEN it matches the static cache location block
- AND responds with the same cache headers

### Requirement: Existing cache headers unchanged

The existing `expires 1y` and `Cache-Control: public, immutable` headers MUST remain. The SPA fallback locations (`/`, `/admin`) MUST remain without cache headers.

#### Scenario: HTML routes stay uncached

- GIVEN a request to `/` or `/admin/dashboard`
- WHEN nginx processes the request
- THEN it matches the SPA fallback location blocks (not the static cache block)
- AND no `Cache-Control` or `expires` header is added
