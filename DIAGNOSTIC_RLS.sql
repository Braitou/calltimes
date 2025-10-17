-- DIAGNOSTIC : Vérifier l'état actuel des RLS policies

-- 1. Vérifier les policies sur projects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'projects';

-- 2. Vérifier les policies sur project_members
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'project_members';

-- 3. Vérifier les policies sur project_files
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'project_files';

-- 4. Vérifier les policies sur project_folders
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'project_folders';

-- 5. Test simple : Compter les projets visibles
SELECT COUNT(*) as visible_projects FROM projects;

-- 6. Test : Vérifier ton auth
SELECT 
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- 7. Vérifier ta membership
SELECT 
  u.id as user_id,
  u.email,
  m.organization_id,
  m.role
FROM auth.users u
LEFT JOIN memberships m ON m.user_id = u.id
WHERE u.email = 'bandiera.simon@gmail.com'; -- Remplace par ton email

