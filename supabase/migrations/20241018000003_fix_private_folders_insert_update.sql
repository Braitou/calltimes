-- Migration: Fix private folders - block INSERT/UPDATE for guests
-- Date: 2024-10-18
-- Description: Prevent guests from adding/modifying files in private folders

-- 1. Update INSERT policy for project_files
-- Guests should NOT be able to insert files into private folders
DROP POLICY IF EXISTS "Users can upload files to their projects" ON project_files;

CREATE POLICY "Users can upload files to their projects"
ON project_files
FOR INSERT
WITH CHECK (
  -- Organization members can upload anywhere
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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

-- 2. Update UPDATE policy for project_files
-- Guests should NOT be able to move files into private folders
DROP POLICY IF EXISTS "Users can update their own files" ON project_files;

CREATE POLICY "Users can update their own files"
ON project_files
FOR UPDATE
USING (
  -- Organization members can update any file
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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
  -- Organization members can move files anywhere
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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

-- 3. Also update DELETE policy to prevent deleting files in private folders
DROP POLICY IF EXISTS "Users can delete their own files" ON project_files;

CREATE POLICY "Users can delete their own files"
ON project_files
FOR DELETE
USING (
  -- Organization members can delete any file
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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


