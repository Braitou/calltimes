-- Migration: Fix organization access - only owners have full access
-- Date: 2024-10-18
-- Description: Ensure that only organization owners (not editors/viewers) bypass private folder restrictions

-- IMPORTANT: In this system, Editors and Viewers are ALWAYS project guests (external users)
-- Only Owners are organization members with full access

-- 1. Update RLS policy for project_folders SELECT
DROP POLICY IF EXISTS "Users can view folders in their projects" ON project_folders;

CREATE POLICY "Users can view folders in their projects"
ON project_folders
FOR SELECT
USING (
  -- Organization members with OWNER role can see all folders (including private ones)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'  -- CRITICAL: Only owners, not all members
  )
  OR
  -- Project guests (editors/viewers) can ONLY see non-private folders
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_folders.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('viewer', 'editor')
    )
    AND is_private = FALSE
  )
);

-- 2. Update RLS policy for project_files SELECT
DROP POLICY IF EXISTS "Users can view files in their projects" ON project_files;

CREATE POLICY "Users can view files in their projects"
ON project_files
FOR SELECT
USING (
  -- Organization owners can see all files
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'  -- CRITICAL: Only owners
  )
  OR
  -- Project guests can see files ONLY if:
  -- 1. File is in root (folder_id IS NULL) OR
  -- 2. File is in a non-private folder
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role IN ('viewer', 'editor')
    )
    AND (
      folder_id IS NULL
      OR
      EXISTS (
        SELECT 1 FROM project_folders pf
        WHERE pf.id = project_files.folder_id
        AND pf.is_private = FALSE
      )
    )
  )
);

-- 3. Update INSERT policy for project_files
DROP POLICY IF EXISTS "Users can upload files to their projects" ON project_files;

CREATE POLICY "Users can upload files to their projects"
ON project_files
FOR INSERT
WITH CHECK (
  -- Organization owners can upload anywhere
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'  -- CRITICAL: Only owners
  )
  OR
  -- Project editors can upload ONLY to root or non-private folders
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND (
      folder_id IS NULL
      OR
      EXISTS (
        SELECT 1 FROM project_folders pf
        WHERE pf.id = project_files.folder_id
        AND pf.is_private = FALSE
      )
    )
  )
);

-- 4. Update UPDATE policy for project_files
DROP POLICY IF EXISTS "Users can update their own files" ON project_files;

CREATE POLICY "Users can update their own files"
ON project_files
FOR UPDATE
USING (
  -- Organization owners can update any file
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'  -- CRITICAL: Only owners
  )
  OR
  -- Editors can update their own files
  (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
  )
)
WITH CHECK (
  -- Organization owners can move files anywhere
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'  -- CRITICAL: Only owners
  )
  OR
  -- Editors can move files ONLY to root or non-private folders
  (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND (
      folder_id IS NULL
      OR
      EXISTS (
        SELECT 1 FROM project_folders pf
        WHERE pf.id = project_files.folder_id
        AND pf.is_private = FALSE
      )
    )
  )
);

-- 5. Update DELETE policy for project_files
DROP POLICY IF EXISTS "Users can delete their own files" ON project_files;

CREATE POLICY "Users can delete their own files"
ON project_files
FOR DELETE
USING (
  -- Organization owners can delete any file
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
    AND m.role = 'owner'  -- CRITICAL: Only owners
  )
  OR
  -- Editors can delete their own files (but not in private folders)
  (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND (
      folder_id IS NULL
      OR
      EXISTS (
        SELECT 1 FROM project_folders pf
        WHERE pf.id = project_files.folder_id
        AND pf.is_private = FALSE
      )
    )
  )
);

-- 6. Add comment for clarity
COMMENT ON TABLE project_folders IS 'Folders in projects. Private folders are only visible to organization owners, not to project guests (editors/viewers).';


