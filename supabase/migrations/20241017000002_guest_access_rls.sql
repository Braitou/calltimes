/**
 * CALL TIMES - Guest Access RLS Policies
 * 
 * Sécurisation multi-niveau :
 * - Membres organisation : Full access
 * - Project Guests (role=viewer) : Read-only access (SELECT only)
 * - Call Sheets : Interdits pour les guests (même SELECT bloqué)
 */

-- ============================================
-- 1. PROJECT_FILES : Viewers = SELECT ONLY
-- ============================================

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "project_files_select" ON project_files;
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_update" ON project_files;
DROP POLICY IF EXISTS "project_files_delete" ON project_files;

-- Policy SELECT : Org members OU project guests (tous rôles)
CREATE POLICY "project_files_select" ON project_files
FOR SELECT
USING (
  -- Membres organisation (via project ownership)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project guests (viewers, editors, owners)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
  )
);

-- Policy INSERT : Org members OU project editors/owners (PAS viewers)
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
  -- Project editors/owners (pas viewers)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('editor', 'owner')
  )
);

-- Policy UPDATE : Org members OU project editors/owners
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

-- Policy DELETE : Org members OU project owners
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

-- ============================================
-- 2. PROJECT_FOLDERS : Viewers = SELECT ONLY
-- ============================================

DROP POLICY IF EXISTS "project_folders_select" ON project_folders;
DROP POLICY IF EXISTS "project_folders_insert" ON project_folders;
DROP POLICY IF EXISTS "project_folders_update" ON project_folders;
DROP POLICY IF EXISTS "project_folders_delete" ON project_folders;

-- SELECT : Org members OU project guests
CREATE POLICY "project_folders_select" ON project_folders
FOR SELECT
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
  )
);

-- INSERT : Org members OU editors/owners
CREATE POLICY "project_folders_insert" ON project_folders
FOR INSERT
WITH CHECK (
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

-- UPDATE : Org members OU editors/owners
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

-- DELETE : Org members OU owners
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

-- ============================================
-- 3. CALL_SHEETS : AUCUN accès pour guests
-- ============================================

DROP POLICY IF EXISTS "call_sheets_select" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_insert" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_update" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_delete" ON call_sheets;

-- SELECT : UNIQUEMENT membres organisation (NO project guests)
CREATE POLICY "call_sheets_select" ON call_sheets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = call_sheets.project_id
    AND m.user_id = auth.uid()
  )
);

-- INSERT : Membres organisation seulement
CREATE POLICY "call_sheets_insert" ON call_sheets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = call_sheets.project_id
    AND m.user_id = auth.uid()
  )
);

-- UPDATE : Membres organisation seulement
CREATE POLICY "call_sheets_update" ON call_sheets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = call_sheets.project_id
    AND m.user_id = auth.uid()
  )
);

-- DELETE : Membres organisation seulement
CREATE POLICY "call_sheets_delete" ON call_sheets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = call_sheets.project_id
    AND m.user_id = auth.uid()
  )
);

-- ============================================
-- 4. PROJECT_MEMBERS : Gérer les invitations
-- ============================================

DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

-- SELECT : Org members OU members du projet (pour voir la team)
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

-- INSERT : Org members OU project owners
CREATE POLICY "project_members_insert" ON project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

-- UPDATE : Org members OU project owners
CREATE POLICY "project_members_update" ON project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

-- DELETE : Org members OU project owners
CREATE POLICY "project_members_delete" ON project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_members.project_id
    AND pm.user_id = auth.uid()
    AND pm.role = 'owner'
  )
);

-- ============================================
-- RÉSUMÉ DES PERMISSIONS
-- ============================================
-- 
-- MEMBRES ORGANISATION (Victor, Simon) :
-- ✅ Full access : SELECT, INSERT, UPDATE, DELETE
-- ✅ Tous les projets de l'organisation
-- ✅ Tous les fichiers, dossiers, call sheets
-- 
-- PROJECT GUESTS - EDITORS :
-- ✅ SELECT, INSERT, UPDATE fichiers/dossiers
-- ❌ NO access call sheets
-- 
-- PROJECT GUESTS - VIEWERS (Philippe) :
-- ✅ SELECT fichiers/dossiers (read-only)
-- ❌ NO INSERT, UPDATE, DELETE
-- ❌ NO access call sheets
-- 
-- ============================================

