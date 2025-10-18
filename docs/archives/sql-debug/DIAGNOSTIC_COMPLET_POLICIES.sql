-- =====================================================
-- DIAGNOSTIC COMPLET - LISTER TOUTES LES POLICIES
-- =====================================================

-- 1. TOUTES les policies sur projects
SELECT 
  'PROJECTS' as table_name,
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY cmd, policyname;

-- 2. TOUTES les policies sur project_members
SELECT 
  'PROJECT_MEMBERS' as table_name,
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'project_members'
ORDER BY cmd, policyname;

-- 3. Compter TOUTES les policies par table et par commande
SELECT 
  tablename,
  cmd,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders', 'call_sheets')
GROUP BY tablename, cmd
ORDER BY tablename, cmd;

-- 4. Détecter les doublons (plusieurs policies SELECT sur la même table)
SELECT 
  tablename,
  cmd,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 1 THEN '⚠️ DOUBLON DÉTECTÉ !'
    ELSE 'OK'
  END as status
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members', 'project_files', 'project_folders', 'call_sheets')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

