# Delta for Dependency Security

## ADDED Requirements

### Requirement: Vulnerable deps MUST be updated

The frontend dependencies with known vulnerabilities MUST be updated to patched versions where minor/patch range allows.

#### Scenario: npm audit passes after update

- GIVEN the current package.json
- WHEN `npm audit` is run after updates
- THEN the number of vulnerabilities SHALL be reduced from the current baseline
- AND the application MUST still build and function correctly

#### Scenario: Breaking changes SHALL NOT be introduced

- GIVEN a dependency requires a major version bump to fix a vulnerability
- WHEN that major bump would break the build or runtime behavior
- THEN the update SHALL be deferred with a documented rationale
