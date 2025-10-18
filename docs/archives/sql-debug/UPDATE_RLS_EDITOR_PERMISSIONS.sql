-- ============================================================================
-- CALL TIMES - Update RLS Policies for Editor Role
-- ============================================================================
-- Ce script met à jour les policies RLS pour permettre aux editors:
-- - D'uploader des fichiers
-- - De créer des dossiers
-- - De modifier/supprimer UNIQUEMENT leurs propres fichiers/dossiers
-- Les owners gardent un accès complet

-- ============================================================================
-- 1. PROJECT_FILES - Permissions granulaires
-- ============================================================================

-- DROP existing policies
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_update" ON project_files;
DROP POLICY IF EXISTS "project_files_delete" ON project_files;

-- INSERT: Membres org (owners) + Editors peuvent uploader
CREATE POLICY "project_files_insert" ON project_files
FOR INSERT
WITH CHECK (
  -- Membres organisation (owners)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project members avec role owner ou editor
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners peuvent tout modifier, Editors seulement leurs propres fichiers
CREATE POLICY "project_files_update" ON project_files
FOR UPDATE
USING (
  -- Membres organisation (owners) peuvent tout modifier
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project owners peuvent tout modifier
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
  OR
  -- Editors peuvent modifier SEULEMENT leurs propres fichiers
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND project_files.uploaded_by = auth.uid()
  )
);

-- DELETE: Owners peuvent tout supprimer, Editors seulement leurs propres fichiers
CREATE POLICY "project_files_delete" ON project_files
FOR DELETE
USING (
  -- Membres organisation (owners) peuvent tout supprimer
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project owners peuvent tout supprimer
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
  OR
  -- Editors peuvent supprimer SEULEMENT leurs propres fichiers
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND project_files.uploaded_by = auth.uid()
  )
);

-- ============================================================================
-- 2. PROJECT_FOLDERS - Permissions granulaires
-- ============================================================================

-- DROP existing policies
DROP POLICY IF EXISTS "project_folders_insert" ON project_folders;
DROP POLICY IF EXISTS "project_folders_update" ON project_folders;
DROP POLICY IF EXISTS "project_folders_delete" ON project_folders;

-- INSERT: Membres org (owners) + Editors peuvent créer des dossiers
CREATE POLICY "project_folders_insert" ON project_folders
FOR INSERT
WITH CHECK (
  -- Membres organisation (owners)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project members avec role owner ou editor
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('owner', 'editor')
  )
);

-- UPDATE: Owners peuvent tout modifier, Editors seulement leurs propres dossiers
CREATE POLICY "project_folders_update" ON project_folders
FOR UPDATE
USING (
  -- Membres organisation (owners) peuvent tout modifier
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project owners peuvent tout modifier
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
  OR
  -- Editors peuvent modifier SEULEMENT leurs propres dossiers
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_folders.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND project_folders.created_by = auth.uid()
  )
);

-- DELETE: Owners peuvent tout supprimer, Editors seulement leurs propres dossiers
CREATE POLICY "project_folders_delete" ON project_folders
FOR DELETE
USING (
  -- Membres organisation (owners) peuvent tout supprimer
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project owners peuvent tout supprimer
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
  OR
  -- Editors peuvent supprimer SEULEMENT leurs propres dossiers
  (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_folders.project_id
      AND pm.user_id = auth.uid()
      AND pm.role = 'editor'
    )
    AND project_folders.created_by = auth.uid()
  )
);

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- Les editors pourront maintenant:
-- ✅ Uploader des fichiers
-- ✅ Créer des dossiers
-- ✅ Modifier/Supprimer leurs propres fichiers/dossiers
-- ❌ Modifier/Supprimer les fichiers/dossiers des autres

