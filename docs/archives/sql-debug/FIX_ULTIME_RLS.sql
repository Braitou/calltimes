-- =====================================================
-- FIX ULTIME - FORCE LA SUPPRESSION ET RECRÉATION
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : DÉSACTIVER TEMPORAIREMENT RLS
-- =====================================================

ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_folders DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheets DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 2 : SUPPRIMER TOUTES LES POLICIES (FORCE)
-- =====================================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Supprimer toutes les policies sur projects
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON projects';
    END LOOP;
    
    -- Supprimer toutes les policies sur project_members
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_members') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON project_members';
    END LOOP;
    
    -- Supprimer toutes les policies sur project_files
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_files') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON project_files';
    END LOOP;
    
    -- Supprimer toutes les policies sur project_folders
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_folders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON project_folders';
    END LOOP;
    
    -- Supprimer toutes les policies sur call_sheets
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'call_sheets') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON call_sheets';
    END LOOP;
END $$;

-- =====================================================
-- ÉTAPE 3 : RÉACTIVER RLS
-- =====================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 4 : CRÉER LES NOUVELLES POLICIES (SANS RÉCURSION)
-- =====================================================

-- PROJECTS : UNIQUEMENT via memberships
CREATE POLICY "projects_select" ON projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships m
    WHERE m.organization_id = projects.organization_id
    AND m.user_id = auth.uid()
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

-- PROJECT_MEMBERS
CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  (invitation_status = 'pending')
  OR
  (project_members.user_id = auth.uid())
  OR
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

-- PROJECT_FILES
CREATE POLICY "project_files_select" ON project_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_files.project_id
    AND m.user_id = auth.uid()
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

-- PROJECT_FOLDERS
CREATE POLICY "project_folders_select" ON project_folders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_folders.project_id
    AND m.user_id = auth.uid()
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

-- CALL_SHEETS
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
-- VÉRIFICATIONS FINALES
-- =====================================================

-- Compter les policies (devrait être 20)
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders', 'call_sheets')
GROUP BY tablename
ORDER BY tablename;

-- Tester la lecture des projets
SELECT COUNT(*) as visible_projects FROM projects;

-- Afficher ton user
SELECT auth.uid() as my_user_id, auth.email() as my_email;

