-- =====================================================
-- RLS DÉFINITIF - CALL TIMES
-- Multi-Level Access Control : Org Members + Project Guests
-- 
-- Ce SQL configure TOUTES les policies RLS nécessaires
-- pour le bon fonctionnement de l'application
-- =====================================================

-- =====================================================
-- 1. PROJECTS - Lecture des projets
-- =====================================================

-- Supprimer toutes les anciennes policies
DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

-- SELECT : Membres org + Project members + Guests anonymes
CREATE POLICY "projects_select" ON projects
FOR SELECT
USING (
  -- Membres organisation (accès à tous les projets de leur org)
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Membres authentifiés du projet (project_members avec user_id)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = projects.id
    AND pm.user_id = auth.uid()
  )
  OR
  -- Guests anonymes : autorise la lecture si projet a invitations pending
  -- (Le composant React vérifiera ensuite le token spécifique)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = projects.id
    AND pm.invitation_status = 'pending'
  )
);

-- INSERT : Uniquement membres org
CREATE POLICY "projects_insert" ON projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
);

-- UPDATE : Uniquement membres org
CREATE POLICY "projects_update" ON projects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
);

-- DELETE : Uniquement membres org
CREATE POLICY "projects_delete" ON projects
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
);

-- =====================================================
-- 2. PROJECT_MEMBERS - Gestion des membres/invitations
-- =====================================================

DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

-- SELECT : Public pour invitations pending, privé pour le reste
CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  -- Invitations pending : PUBLIC (pour validation token guest)
  (invitation_status = 'pending')
  OR
  -- Membres org : peuvent voir tous les membres de leurs projets
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- User peut voir ses propres records
  (project_members.user_id = auth.uid())
);

-- INSERT : Uniquement membres org (pour inviter)
CREATE POLICY "project_members_insert" ON project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

-- UPDATE : Uniquement membres org
CREATE POLICY "project_members_update" ON project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

-- DELETE : Uniquement membres org
CREATE POLICY "project_members_delete" ON project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

-- =====================================================
-- 3. PROJECT_FILES - Fichiers du projet
-- =====================================================

DROP POLICY IF EXISTS "project_files_select" ON project_files;
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_update" ON project_files;
DROP POLICY IF EXISTS "project_files_delete" ON project_files;

-- SELECT : Membres org + Project members + Guests
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
  -- Membres authentifiés du projet
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
  )
  OR
  -- Guests : autorise si projet a invitations pending
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.invitation_status = 'pending'
  )
);

-- INSERT : Membres org + Project owners/editors
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
  -- Project owners/editors (pas viewers)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('owner', 'editor')
  )
);

-- UPDATE : Membres org + Project owners/editors
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
    AND pm.role IN ('owner', 'editor')
  )
);

-- DELETE : Membres org + Project owners
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

-- =====================================================
-- 4. PROJECT_FOLDERS - Dossiers du projet
-- =====================================================

DROP POLICY IF EXISTS "project_folders_select" ON project_folders;
DROP POLICY IF EXISTS "project_folders_insert" ON project_folders;
DROP POLICY IF EXISTS "project_folders_update" ON project_folders;
DROP POLICY IF EXISTS "project_folders_delete" ON project_folders;

-- SELECT : Membres org + Project members + Guests
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
  -- Membres authentifiés du projet
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.user_id = auth.uid()
  )
  OR
  -- Guests : autorise si projet a invitations pending
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.invitation_status = 'pending'
  )
);

-- INSERT : Membres org + Project owners/editors
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
    AND pm.role IN ('owner', 'editor')
  )
);

-- UPDATE : Membres org + Project owners/editors
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
    AND pm.role IN ('owner', 'editor')
  )
);

-- DELETE : Membres org + Project owners
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

-- =====================================================
-- 5. CALL_SHEETS - Uniquement membres org (PAS guests)
-- =====================================================

DROP POLICY IF EXISTS "call_sheets_select" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_insert" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_update" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_delete" ON call_sheets;

-- SELECT : Uniquement membres org
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

-- INSERT : Uniquement membres org
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

-- UPDATE : Uniquement membres org
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

-- DELETE : Uniquement membres org
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

-- =====================================================
-- 6. VÉRIFICATIONS
-- =====================================================

-- Test 1 : Vérifier ton user ID
SELECT auth.uid() as my_user_id, auth.email() as my_email;

-- Test 2 : Compter les projets visibles
SELECT COUNT(*) as visible_projects FROM projects;

-- Test 3 : Lister les policies actives
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING clause'
    WHEN with_check IS NOT NULL THEN 'WITH CHECK clause'
    ELSE 'No conditions'
  END as policy_type
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders', 'call_sheets')
ORDER BY tablename, policyname;

