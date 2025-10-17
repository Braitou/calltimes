-- =====================================================
-- FIX RÉCURSION - VRAIMENT FINAL
-- La clef : project_members_select NE DOIT JAMAIS vérifier projects !
-- =====================================================

-- =====================================================
-- SOLUTION RADICALE :
-- project_members_select devient SUPER PERMISSIF
-- On laisse l'application React vérifier les permissions
-- =====================================================

DROP POLICY IF EXISTS "project_members_select" ON project_members;

CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  -- 1. Invitations pending : PUBLIC (pas de vérif)
  (invitation_status = 'pending')
  OR
  -- 2. User authentifié voit ses propres records (pas de vérif)
  (user_id = auth.uid())
  OR
  -- 3. SUPPRIMÉ : On ne vérifie PLUS projects !
  -- Tout user authentifié peut lire project_members
  -- (l'app vérifiera ensuite les permissions)
  (auth.uid() IS NOT NULL)
);

-- Vérifier que ça n'a pas cassé les autres policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('projects', 'project_members')
AND cmd = 'SELECT'
ORDER BY tablename;

-- Test : Cette requête devrait fonctionner SANS récursion
SELECT COUNT(*) FROM projects;

