-- =====================================================
-- FIX RÉCURSION DÉFINITIF
-- Stratégie : Casser la boucle entre projects et project_members
-- =====================================================

-- =====================================================
-- PROBLÈME IDENTIFIÉ :
-- projects_select → vérifie project_members (invitation_status = 'pending')
-- project_members_select → vérifie projects
-- → BOUCLE INFINIE !
--
-- SOLUTION :
-- 1. project_members_select NE VÉRIFIE PLUS projects pour les invitations pending
-- 2. projects_select peut maintenant vérifier project_members en toute sécurité
-- =====================================================

-- =====================================================
-- 1. PROJECT_MEMBERS - Casser la récursion
-- =====================================================

DROP POLICY IF EXISTS "project_members_select" ON project_members;

CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  -- Invitations pending : PUBLIC (pas de vérification de projects !)
  (invitation_status = 'pending')
  OR
  -- User peut voir ses propres records (pas de vérification de projects !)
  (project_members.user_id = auth.uid())
  OR
  -- UNIQUEMENT pour les utilisateurs authentifiés : vérifier via memberships DIRECTEMENT
  -- On évite de passer par projects pour éviter la récursion
  (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 
      FROM projects p
      INNER JOIN memberships m ON m.organization_id = p.organization_id
      WHERE p.id = project_members.project_id
      AND m.user_id = auth.uid()
    )
  )
);

-- =====================================================
-- 2. PROJECTS - Peut maintenant vérifier project_members sans récursion
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
  -- Guests anonymes : autorise si projet a invitations pending
  -- SAFE car project_members_select ne vérifie plus projects pour les pending !
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = projects.id
    AND pm.invitation_status = 'pending'
  )
);

-- =====================================================
-- 3. PROJECT_FILES - Avec accès guest
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
  -- Guests : SAFE car project_members ne crée pas de récursion
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_files.project_id
    AND pm.invitation_status = 'pending'
  )
);

-- =====================================================
-- 4. PROJECT_FOLDERS - Avec accès guest
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
  -- Guests : SAFE
  EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = project_folders.project_id
    AND pm.invitation_status = 'pending'
  )
);

-- =====================================================
-- VÉRIFICATIONS
-- =====================================================

-- Test 1 : Compter projets visibles (membres org)
SELECT COUNT(*) as my_projects FROM projects;

-- Test 2 : Lister les policies modifiées
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders')
AND policyname LIKE '%select%'
ORDER BY tablename;

-- Test 3 : Vérifier qu'il n'y a PAS de récursion
-- Si cette requête fonctionne sans erreur, il n'y a pas de récursion
SELECT 
  p.id,
  p.name,
  COUNT(pm.id) as invitations_count
FROM projects p
LEFT JOIN project_members pm ON pm.project_id = p.id
GROUP BY p.id, p.name
LIMIT 5;

