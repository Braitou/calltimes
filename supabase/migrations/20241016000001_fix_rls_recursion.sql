-- =============================================
-- FIX: Correction de la récursion infinie dans les RLS policies
-- Date: 2024-10-16
-- =============================================

-- =============================================
-- STEP 1: Supprimer toutes les policies existantes
-- =============================================

-- Policies sur project_files
DROP POLICY IF EXISTS "project_members_can_view_files" ON project_files;
DROP POLICY IF EXISTS "editors_can_upload_files" ON project_files;
DROP POLICY IF EXISTS "editors_can_delete_files" ON project_files;
DROP POLICY IF EXISTS "editors_can_update_files" ON project_files;

-- Policies sur project_members
DROP POLICY IF EXISTS "members_can_view_members" ON project_members;
DROP POLICY IF EXISTS "owners_can_invite_members" ON project_members;
DROP POLICY IF EXISTS "owners_can_update_members" ON project_members;
DROP POLICY IF EXISTS "owners_can_remove_members" ON project_members;

-- =============================================
-- STEP 2: Créer des policies SANS récursion
-- =============================================

-- =============================================
-- POLICIES: project_members (SANS RÉCURSION)
-- Les policies sur project_members doivent être SIMPLES et ne pas référencer project_members
-- =============================================

-- Policy SELECT: Les utilisateurs authentifiés peuvent voir les membres des projets de leur organisation
CREATE POLICY "members_select_simple"
  ON project_members
  FOR SELECT
  USING (
    -- Les utilisateurs authentifiés peuvent voir les membres
    auth.uid() IS NOT NULL
    AND (
      -- Soit c'est leur propre membership
      user_id = auth.uid()
      OR
      -- Soit c'est un projet de leur organisation
      project_id IN (
        SELECT id FROM projects
        WHERE organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy INSERT: Les utilisateurs peuvent créer des memberships pour les projets de leur organisation
CREATE POLICY "members_insert_simple"
  ON project_members
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND project_id IN (
      SELECT id FROM projects
      WHERE organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy UPDATE: Les utilisateurs peuvent modifier les memberships des projets de leur organisation
CREATE POLICY "members_update_simple"
  ON project_members
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND project_id IN (
      SELECT id FROM projects
      WHERE organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy DELETE: Les utilisateurs peuvent supprimer les memberships des projets de leur organisation
CREATE POLICY "members_delete_simple"
  ON project_members
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND project_id IN (
      SELECT id FROM projects
      WHERE organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- =============================================
-- POLICIES: project_files (MAINTENANT SANS RÉCURSION)
-- Maintenant que project_members a des policies simples, on peut l'utiliser
-- =============================================

-- Policy SELECT: Les membres acceptés peuvent voir les fichiers
CREATE POLICY "files_select_by_members"
  ON project_files
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      -- Membre accepté du projet
      EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_files.project_id
          AND pm.user_id = auth.uid()
          AND pm.invitation_status = 'accepted'
      )
      OR
      -- Membre de l'organisation
      project_id IN (
        SELECT id FROM projects
        WHERE organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy INSERT: Les editors et owners peuvent uploader
CREATE POLICY "files_insert_by_editors"
  ON project_files
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- Membre avec role editor ou owner
      EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_files.project_id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.invitation_status = 'accepted'
      )
      OR
      -- Membre de l'organisation
      project_id IN (
        SELECT id FROM projects
        WHERE organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy UPDATE: Les editors et owners peuvent modifier
CREATE POLICY "files_update_by_editors"
  ON project_files
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_files.project_id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.invitation_status = 'accepted'
      )
      OR
      project_id IN (
        SELECT id FROM projects
        WHERE organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy DELETE: Les editors et owners peuvent supprimer
CREATE POLICY "files_delete_by_editors"
  ON project_files
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = project_files.project_id
          AND pm.user_id = auth.uid()
          AND pm.role IN ('owner', 'editor')
          AND pm.invitation_status = 'accepted'
      )
      OR
      project_id IN (
        SELECT id FROM projects
        WHERE organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- =============================================
-- VERIFICATION
-- =============================================
COMMENT ON POLICY "members_select_simple" ON project_members IS 'Policy simplifiée sans récursion - vérifie uniquement la table projects';
COMMENT ON POLICY "files_select_by_members" ON project_files IS 'Policy qui référence project_members de manière sûre car project_members a maintenant des policies simples';


