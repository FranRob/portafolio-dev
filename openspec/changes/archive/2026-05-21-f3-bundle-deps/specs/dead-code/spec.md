# Delta for Dead Code Removal

## ADDED Requirements

### Requirement: Unused components MUST be removed

Components and hooks that are never imported by any other module MUST be deleted.

#### Scenario: NeonBorder removes successfully

- GIVEN the file `frontend/src/components/ui/NeonBorder.tsx`
- WHEN a grep for `from.*NeonBorder` or `import.*NeonBorder` across all `.tsx`/`.ts` files returns zero matches
- THEN the file SHALL be deleted

#### Scenario: useCache removes successfully

- GIVEN the file `frontend/src/hooks/useCache.ts`
- WHEN a grep for `from.*useCache\|from.*useCachedFetch` returns zero matches
- THEN the file SHALL be deleted

### Requirement: Unused exports SHALL be removed

Named exports that are never imported by any other module SHALL be removed from their source file.

#### Scenario: TabsSkeleton and FormSkeleton removed

- GIVEN `AdminSkeleton.tsx` exports `TabsSkeleton` and `FormSkeleton`
- WHEN neither export is imported by any other file
- THEN both exports SHALL be removed from the file

#### Scenario: ProjectsSkeleton and MessagesSkeleton preserved

- GIVEN `ProjectsSkeleton` is imported by `AdminProjects.tsx`
- AND `MessagesSkeleton` is imported by `AdminMessages.tsx`
- THEN both exports MUST remain in `AdminSkeleton.tsx`
