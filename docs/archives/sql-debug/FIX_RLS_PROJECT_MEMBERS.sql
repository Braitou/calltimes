/**
 * FIX IMMÉDIAT : RLS Policies pour project_members
 * 
 * Problème : Les anciennes policies bloquent l'invitation
 * Solution : Recréer les policies avec la bonne logique
 */

-- ============================================
-- 1. SUPPRIMER TOUTES LES POLICIES EXISTANTES
-- ============================================

DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;
DROP POLICY IF EXISTS "project_members_delete" ON project_members;

-- ============================================
-- 2. RECRÉER LES POLICIES project_members
-- ============================================

-- SELECT : Org members OU members du projet (pour voir la team)
CREATE POLICY "project_members_select" ON project_members
FOR SELECT
USING (
  -- Membres organisation (via projects table)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Membres du projet eux-mêmes (peuvent voir leur propre membership)
  project_members.user_id = auth.uid()
);

-- INSERT : Org members OU project owners peuvent inviter
CREATE POLICY "project_members_insert" ON project_members
FOR INSERT
WITH CHECK (
  -- Membres organisation (accès complet)
  EXISTS (
    SELECT 1 FROM projects p
    INNER JOIN memberships m ON m.organization_id = p.organization_id
    WHERE p.id = project_members.project_id
    AND m.user_id = auth.uid()
  )
  OR
  -- Project owners peuvent aussi inviter
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
-- RÉSUMÉ
-- ============================================
-- 
-- ✅ Org members (Victor/Simon) : Full access (SELECT/INSERT/UPDATE/DELETE)
-- ✅ Project owners : Peuvent inviter d'autres membres
-- ✅ Project guests : Peuvent voir leur propre membership
-- 
-- ============================================

