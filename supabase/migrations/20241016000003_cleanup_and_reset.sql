-- =============================================
-- CLEANUP & RESET: Nettoyer tous les projets de test
-- Date: 2024-10-16
-- =============================================

-- =============================================
-- STEP 1: Supprimer TOUTES les données de test
-- =============================================

-- Désactiver temporairement RLS pour le nettoyage
ALTER TABLE project_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les données (CASCADE supprime automatiquement les dépendances)
TRUNCATE TABLE project_files CASCADE;
TRUNCATE TABLE project_members CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE call_sheets CASCADE;
TRUNCATE TABLE call_sheet_locations CASCADE;
TRUNCATE TABLE call_sheet_schedule CASCADE;
TRUNCATE TABLE call_sheet_team_rows CASCADE;

-- Garder users et memberships pour ne pas perdre les comptes

-- Réactiver RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 2: Créer UNE organisation de test
-- =============================================

-- Supprimer les anciennes organisations de test si elles existent
DELETE FROM organizations WHERE name LIKE '%Test%' OR name LIKE '%Studio%' OR name LIKE '%Indie%' OR name LIKE '%Commercial%';

-- Créer une nouvelle organisation propre
INSERT INTO organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Ma Production')
ON CONFLICT (id) DO UPDATE SET name = 'Ma Production';

-- =============================================
-- STEP 3: Ajouter l'utilisateur actuel à l'organisation
-- =============================================

-- Cette fonction sera appelée manuellement après la migration
-- pour ajouter l'utilisateur connecté à l'organisation

CREATE OR REPLACE FUNCTION add_current_user_to_org()
RETURNS void AS $$
BEGIN
  -- Ajouter l'utilisateur actuel comme owner de l'organisation de test
  INSERT INTO memberships (user_id, organization_id, role)
  VALUES (auth.uid(), '00000000-0000-0000-0000-000000000001', 'owner')
  ON CONFLICT (user_id, organization_id) DO UPDATE SET role = 'owner';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VERIFICATION
-- =============================================

-- Compter ce qui reste
DO $$
DECLARE
  org_count INT;
  user_count INT;
  membership_count INT;
  project_count INT;
BEGIN
  SELECT COUNT(*) INTO org_count FROM organizations;
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO membership_count FROM memberships;
  SELECT COUNT(*) INTO project_count FROM projects;
  
  RAISE NOTICE '✅ Nettoyage terminé:';
  RAISE NOTICE '   - Organizations: %', org_count;
  RAISE NOTICE '   - Users: %', user_count;
  RAISE NOTICE '   - Memberships: %', membership_count;
  RAISE NOTICE '   - Projects: % (devrait être 0)', project_count;
END $$;

-- =============================================
-- INSTRUCTIONS POST-MIGRATION
-- =============================================

COMMENT ON FUNCTION add_current_user_to_org() IS 'Appeler cette fonction après login pour ajouter l''utilisateur à l''organisation de test: SELECT add_current_user_to_org();';

