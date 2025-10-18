-- Migration: Add private folders feature
-- Date: 2024-10-18
-- Description: Add is_private column to project_folders and update RLS policies

-- 1. Add is_private column to project_folders
ALTER TABLE project_folders
ADD COLUMN is_private BOOLEAN DEFAULT FALSE;

-- 2. Update RLS policy for project_folders SELECT
-- Guests (viewers/editors) should NOT see private folders
DROP POLICY IF EXISTS "Users can view folders in their projects" ON project_folders;

CREATE POLICY "Users can view folders in their projects"
ON project_folders
FOR SELECT
USING (
  -- Organization members can see all folders (including private ones)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project guests can ONLY see non-private folders
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

-- 3. Update RLS policy for project_files SELECT
-- Files inside private folders should also be hidden from guests
DROP POLICY IF EXISTS "Users can view files in their projects" ON project_files;

CREATE POLICY "Users can view files in their projects"
ON project_files
FOR SELECT
USING (
  -- Organization members can see all files
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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

-- 4. Comment for documentation
COMMENT ON COLUMN project_folders.is_private IS 'If true, folder and its contents are only visible to organization members, not project guests';


