-- AlterTable: add slug and content columns to Project
ALTER TABLE "Project" ADD COLUMN "slug" TEXT;
ALTER TABLE "Project" ADD COLUMN "content" TEXT;

-- Populate slugs from existing titles
-- Step 1: set initial slug as lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))
-- Step 2: trim leading/trailing hyphens
UPDATE "Project"
SET "slug" = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'),
      '^-+', '', 'g'
    ),
    '-+$', '', 'g'
  )
);

-- Step 3: Deduplicate slugs by appending -2, -3, etc. for conflicts
-- Use a recursive CTE to detect duplicates and assign suffixes
DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  new_slug TEXT;
  counter INT;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM "Project"
    ORDER BY "createdAt" ASC
  LOOP
    base_slug := rec.slug;
    new_slug := base_slug;
    counter := 2;

    -- Check if this slug already exists for a DIFFERENT row
    WHILE EXISTS (
      SELECT 1 FROM "Project"
      WHERE "slug" = new_slug AND id != rec.id
    ) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    -- Only update if the slug changed
    IF new_slug != rec.slug THEN
      UPDATE "Project" SET "slug" = new_slug WHERE id = rec.id;
    END IF;
  END LOOP;
END $$;

-- Step 4: Make slug NOT NULL and UNIQUE now that all rows have values
ALTER TABLE "Project" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
