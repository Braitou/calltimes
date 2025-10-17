-- =====================================================
-- NETTOYAGE TOTAL DES RLS
-- Supprime TOUTES les policies existantes avant de recréer
-- =====================================================

-- =====================================================
-- 1. SUPPRIMER TOUTES LES POLICIES PROJECTS
-- =====================================================

DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_select_authenticated" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_insert_authenticated" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;
DROP POLICY IF EXISTS "projects_update_authenticated" ON projects;
DROP POLICY IF EXISTS "projects_delete" ON projects;
DROP POLICY IF EXISTS "projects_delete_authenticated" ON projects;

-- =====================================================
-- 2. SUPPRIMER TOUTES LES POLICIES PROJECT_MEMBERS
-- =====================================================

DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;
DROP POLICY IF EXISTS "Anyone authenticated can view project_members" ON project_members;
DROP POLICY IF EXISTS "Anyone authenticated can insert project_members" ON project_members;
DROP POLICY IF EXISTS "Anyone authenticated can update project_members" ON project_members;
DROP POLICY IF EXISTS "Anyone authenticated can delete project_members" ON project_members;
DROP POLICY IF EXISTS "members_select_simple" ON project_members;
DROP POLICY IF EXISTS "members_insert_simple" ON project_members;
DROP POLICY IF EXISTS "members_update_simple" ON project_members;
DROP POLICY IF EXISTS "members_delete_simple" ON project_members;

-- =====================================================
-- 3. SUPPRIMER TOUTES LES POLICIES PROJECT_FILES
-- =====================================================

DROP POLICY IF EXISTS "project_files_select" ON project_files;
DROP POLICY IF EXISTS "project_files_insert" ON project_files;
DROP POLICY IF EXISTS "project_files_update" ON project_files;
DROP POLICY IF EXISTS "project_files_delete" ON project_files;
DROP POLICY IF EXISTS "files_select_by_members" ON project_files;
DROP POLICY IF EXISTS "files_insert_by_editors" ON project_files;
DROP POLICY IF EXISTS "files_update_by_editors" ON project_files;
DROP POLICY IF EXISTS "files_delete_by_editors" ON project_files;

-- =====================================================
-- 4. SUPPRIMER TOUTES LES POLICIES PROJECT_FOLDERS
-- =====================================================

DROP POLICY IF EXISTS "project_folders_select" ON project_folders;
DROP POLICY IF EXISTS "project_folders_insert" ON project_folders;
DROP POLICY IF EXISTS "project_folders_update" ON project_folders;
DROP POLICY IF EXISTS "project_folders_delete" ON project_folders;
DROP POLICY IF EXISTS "project_folders_can_be_viewed_by_project_members" ON project_folders;
DROP POLICY IF EXISTS "project_folders_can_be_created_by_project_members" ON project_folders;
DROP POLICY IF EXISTS "project_folders_can_be_updated_by_project_members" ON project_folders;
DROP POLICY IF EXISTS "project_folders_can_be_deleted_by_project_members" ON project_folders;

-- =====================================================
-- 5. SUPPRIMER TOUTES LES POLICIES CALL_SHEETS
-- =====================================================

DROP POLICY IF EXISTS "call_sheets_select" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_insert" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_update" ON call_sheets;
DROP POLICY IF EXISTS "call_sheets_delete" ON call_sheets;
DROP POLICY IF EXISTS "Users can view organization call sheets" ON call_sheets;
DROP POLICY IF EXISTS "Users can create call sheets in their organization" ON call_sheets;
DROP POLICY IF EXISTS "Users can update organization call sheets" ON call_sheets;
DROP POLICY IF EXISTS "Users can delete organization call sheets" ON call_sheets;
DROP POLICY IF EXISTS "Users can manage organization call sheets" ON call_sheets;

-- =====================================================
-- VÉRIFICATION : Plus aucune policy ne devrait exister
-- =====================================================

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders', 'call_sheets')
GROUP BY tablename
ORDER BY tablename;

-- Si tout est bon, tous les comptes devraient être à 0

