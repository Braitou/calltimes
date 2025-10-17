-- =====================================================
-- RLS SANS RÉCURSION - SIMPLE ET FONCTIONNEL
-- Supprime toute récursion entre projects et project_members
-- =====================================================

-- =====================================================
-- NETTOYAGE
-- =====================================================

DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;

DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

DROP POLICY IF EXISTS "project_files_select" ON project_files;
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_update" ON project_files;
DROP POLICY IF EXISTS "project_files_delete" ON project_files;

DROP POLICY IF EXISTS "project_folders_select" ON project_folders;
DROP POLICY IF EXISTS "project_folders_insert" ON project_folders;
DROP POLICY IF EXISTS "project_folders_update" ON project_folders;
DROP POLICY IF EXISTS "project_folders_delete" ON project_folders;

DROP POLICY IF EXISTS "call_sheets_select" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_insert" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_update" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_delete" ON call_sheets;

-- =====================================================
-- PROJECTS - Vérification UNIQUEMENT via memberships
-- =====================================================

CREATE POLICY "projects_select" ON projects
FOR SELECT
USING (
  -- Membres organisation DIRECTEMENT (pas via project_members)
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Guests : autorise si projet a invitations pending (pas de récursion)
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = projects.id
    AND pm.invitation_status = 'pending'
  )
);

CREATE POLICY "projects_insert" ON projects
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
);

CREATE POLICY "projects_update" ON projects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
);

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
-- PROJECT_MEMBERS - Vérification via memberships (pas via projects)
-- =====================================================

CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  -- Invitations pending : PUBLIC
  (invitation_status = 'pending')
  OR
  -- User peut voir ses propres records
  (project_members.user_id = auth.uid())
  OR
  -- Membres org : vérifie via organization_id du projet
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
);

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
-- PROJECT_FILES - Simplifié
-- =====================================================

CREATE POLICY "project_files_select" ON project_files
FOR SELECT
USING (
  -- Membres org via projects → memberships
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Guests : autorise si projet a invitations pending
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.invitation_status = 'pending'
  )
);

CREATE POLICY "project_files_insert" ON project_files
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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
);

-- =====================================================
-- PROJECT_FOLDERS - Simplifié
-- =====================================================

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
    AND pm.invitation_status = 'pending'
  )
);

CREATE POLICY "project_folders_insert" ON project_folders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
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
);

-- =====================================================
-- CALL_SHEETS - Simplifié
-- =====================================================

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
-- VÉRIFICATIONS
-- =====================================================

-- Test 1 : Compter les projets visibles
SELECT COUNT(*) as visible_projects FROM projects;

-- Test 2 : Lister les policies (devrait être 20)
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders', 'call_sheets')
GROUP BY tablename
ORDER BY tablename;

