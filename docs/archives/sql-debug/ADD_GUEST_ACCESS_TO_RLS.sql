-- =====================================================
-- AJOUTER L'ACCÈS GUEST AUX POLICIES EXISTANTES
-- Permet aux guests avec invitation pending de voir les projets
-- =====================================================

-- =====================================================
-- 1. PROJECTS - Ajouter accès guest
-- =====================================================

DROP POLICY IF EXISTS "projects_select" ON projects;

CREATE POLICY "projects_select" ON projects
FOR SELECT
USING (
  -- Membres organisation
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Guests anonymes : autorise si le projet a des invitations pending
  -- Le composant React vérifiera ensuite le token spécifique en localStorage
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = projects.id
    AND pm.invitation_status = 'pending'
  )
);

-- =====================================================
-- 2. PROJECT_FILES - Ajouter accès guest
-- =====================================================

DROP POLICY IF EXISTS "project_files_select" ON project_files;

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
  -- Guests : autorise si le projet a des invitations pending
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.invitation_status = 'pending'
  )
);

-- =====================================================
-- 3. PROJECT_FOLDERS - Ajouter accès guest
-- =====================================================

DROP POLICY IF EXISTS "project_folders_select" ON project_folders;

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
  -- Guests : autorise si le projet a des invitations pending
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.invitation_status = 'pending'
  )
);

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Vérifier les policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('projects', 'project_files', 'project_folders')
AND cmd = 'SELECT'
ORDER BY tablename;

-- Tester : Compter les projets avec invitations pending (devrait être visible publiquement)
SELECT 
  p.id,
  p.name,
  COUNT(pm.id) as pending_invitations
FROM projects p
LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.invitation_status = 'pending'
GROUP BY p.id, p.name
HAVING COUNT(pm.id) > 0;

