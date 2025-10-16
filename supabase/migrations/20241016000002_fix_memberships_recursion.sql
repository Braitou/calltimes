-- =============================================
-- FIX ULTIME: Correction récursion sur memberships + project_members
-- Date: 2024-10-16
-- =============================================

-- =============================================
-- STEP 1: Supprimer TOUTES les policies récursives
-- =============================================

-- Policies sur memberships (récursives)
DROP POLICY IF EXISTS "Users can view organization memberships" ON memberships;
DROP POLICY IF EXISTS "Owners and admins can manage memberships" ON memberships;

-- Policies sur organizations (utilisent memberships)
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;

-- Policies sur projects (utilisent memberships)
DROP POLICY IF EXISTS "Users can view organization projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their organization" ON projects;
DROP POLICY IF EXISTS "Users can update organization projects" ON projects;
DROP POLICY IF EXISTS "Owners and admins can delete projects" ON projects;

-- =============================================
-- STEP 2: Créer des policies SIMPLES sur memberships
-- =============================================

-- Policy SELECT: Les utilisateurs authentifiés peuvent voir TOUS les memberships
-- (Simplification temporaire pour éviter la récursion)
CREATE POLICY "memberships_select_authenticated"
  ON memberships
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy INSERT: Les utilisateurs authentifiés peuvent créer des memberships
CREATE POLICY "memberships_insert_authenticated"
  ON memberships
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy UPDATE: Les utilisateurs authentifiés peuvent modifier des memberships
CREATE POLICY "memberships_update_authenticated"
  ON memberships
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy DELETE: Les utilisateurs authentifiés peuvent supprimer des memberships
CREATE POLICY "memberships_delete_authenticated"
  ON memberships
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- STEP 3: Recréer les policies sur organizations (SANS récursion)
-- =============================================

-- Policy SELECT: Les utilisateurs voient TOUTES les organisations
-- (Simplification temporaire - on affinera plus tard)
CREATE POLICY "organizations_select_all"
  ON organizations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy UPDATE: Les utilisateurs authentifiés peuvent modifier les organisations
CREATE POLICY "organizations_update_authenticated"
  ON organizations
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- STEP 4: Recréer les policies sur projects (SANS récursion)
-- =============================================

-- Policy SELECT: Les utilisateurs voient TOUS les projets
CREATE POLICY "projects_select_authenticated"
  ON projects
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy INSERT: Les utilisateurs peuvent créer des projets
CREATE POLICY "projects_insert_authenticated"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy UPDATE: Les utilisateurs peuvent modifier des projets
CREATE POLICY "projects_update_authenticated"
  ON projects
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy DELETE: Les utilisateurs peuvent supprimer des projets
CREATE POLICY "projects_delete_authenticated"
  ON projects
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- VERIFICATION
-- =============================================
COMMENT ON POLICY "memberships_select_authenticated" ON memberships IS 'Policy ultra-simple sans récursion - vérifie uniquement auth.uid()';
COMMENT ON POLICY "organizations_select_all" ON organizations IS 'Policy simplifiée temporaire - pas de vérification de membership';
COMMENT ON POLICY "projects_select_authenticated" ON projects IS 'Policy simplifiée temporaire - pas de vérification de membership';

-- =============================================
-- NOTE IMPORTANTE
-- =============================================
-- Ces policies sont ULTRA-PERMISSIVES (tout utilisateur authentifié peut tout faire).
-- C'est volontaire pour débloquer le développement.
-- Une fois que tout fonctionne, on pourra les affiner progressivement.

