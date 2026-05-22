# Delta for Tree Shaking

## ADDED Requirements

### Requirement: Import specificity MUST be verified

All imports from `lucide-react`, `framer-motion`, and other libraries MUST import only the specific APIs used, not entire modules.

#### Scenario: No barrel imports exist

- GIVEN a search for `import \* from '(lucide-react|framer-motion|react-router-dom)'` across all source files
- WHEN the search is executed
- THEN zero results SHALL be found
- AND all imports SHALL use named import syntax `import { X, Y } from 'lib'`

#### Scenario: Dead file references removed

- GIVEN dead code files are deleted (NeonBorder, useCache)
- WHEN any import references to those files exist
- THEN those imports MUST be removed as part of the dead code cleanup
