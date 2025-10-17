/**
 * ⚠️ SQL À EXÉCUTER MAINTENANT DANS SUPABASE
 * 
 * Copier-coller dans Supabase SQL Editor
 * Clic "Run" pour exécuter
 */

-- ============================================
-- FIX project_members RLS Policies
-- ============================================

-- 1. Supprimer TOUTES les anciennes policies
DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;
DROP POLICY IF EXISTS "project_members_can_view_files" ON project_files;
DROP POLICY IF EXISTS "project_members_can_upload_files" ON project_files;
DROP POLICY IF EXISTS "project_members_can_delete_files" ON project_files;
DROP POLICY IF EXISTS "project_files_select" ON project_files;
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_update" ON project_files;
DROP POLICY IF EXISTS "project_files_delete" ON project_files;
DROP POLICY IF EXISTS "project_folders_select" ON project_folders;
DROP POLICY IF EXISTS "project_folders_insert" ON project_folders;
DROP POLICY IF EXISTS "project_folders_update" ON project_folders;
DROP POLICY IF EXISTS "project_folders_delete" ON project_folders;

-- 2. Recréer project_members policies
CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  -- Membres organisation
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Membres du projet eux-mêmes
  project_members.user_id = auth.uid()
);

CREATE POLICY "project_members_insert" ON project_members
FOR INSERT
WITH CHECK (
  -- UNIQUEMENT membres organisation (pas de récursion)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "project_members_update" ON project_members
FOR UPDATE
USING (
  -- UNIQUEMENT membres organisation (pas de récursion)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "project_members_delete" ON project_members
FOR DELETE
USING (
  -- UNIQUEMENT membres organisation (pas de récursion)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

-- 3. Recréer project_files policies
CREATE POLICY "project_files_select" ON project_files
FOR SELECT
USING (
  -- Membres organisation
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project guests (tous rôles)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "project_files_insert" ON project_files
FOR INSERT
WITH CHECK (
  -- Membres organisation
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project editors/owners (PAS viewers)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('editor', 'owner')
  )
);

CREATE POLICY "project_files_update" ON project_files
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('editor', 'owner')
  )
);

CREATE POLICY "project_files_delete" ON project_files
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

-- 4. Recréer project_folders policies
CREATE POLICY "project_folders_select" ON project_folders
FOR SELECT
USING (
  -- Membres organisation
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project guests (tous rôles)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "project_folders_insert" ON project_folders
FOR INSERT
WITH CHECK (
  -- Membres organisation
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project editors/owners (PAS viewers)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('editor', 'owner')
  )
);

CREATE POLICY "project_folders_update" ON project_folders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('editor', 'owner')
  )
);

CREATE POLICY "project_folders_delete" ON project_folders
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

-- ✅ C'EST FINI !
-- Tu peux maintenant inviter des guests au projet

