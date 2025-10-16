-- =============================================
-- FIX: Trigger add_project_creator_as_owner
-- =============================================
-- 
-- PROBLÈME:
-- Le trigger add_project_creator_as_owner() essaie d'accéder à NEW.created_by
-- mais la table projects n'a PAS de colonne created_by
--
-- SOLUTION:
-- Désactiver temporairement ce trigger jusqu'à ce que la gestion
-- des project_members soit implémentée correctement
-- =============================================

-- Supprimer le trigger existant (peu importe son nom)
DROP TRIGGER IF EXISTS auto_add_project_owner ON projects;
DROP TRIGGER IF EXISTS add_creator_as_owner_trigger ON projects;

-- Supprimer la fonction existante avec CASCADE pour supprimer les dépendances
DROP FUNCTION IF EXISTS add_project_creator_as_owner() CASCADE;

-- =============================================
-- VERSION CORRIGÉE (optionnelle pour plus tard)
-- =============================================
-- 
-- Si on veut réactiver cette fonctionnalité, il faudra:
-- 1. Ajouter une colonne created_by à la table projects
-- 2. Récupérer l'email de l'utilisateur depuis auth.users
-- 3. Ou modifier le trigger pour utiliser auth.uid() directement
--
-- Exemple de trigger corrigé (commenté pour l'instant):
/*
CREATE OR REPLACE FUNCTION add_project_creator_as_owner()
RETURNS TRIGGER AS $$
DECLARE
  creator_email TEXT;
BEGIN
  -- Récupérer l'email du créateur depuis auth.users
  SELECT email INTO creator_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Si l'email existe, ajouter le créateur comme owner
  IF creator_email IS NOT NULL THEN
    INSERT INTO project_members (
      project_id,
      user_id,
      email,
      role,
      invitation_status,
      invited_by,
      accepted_at
    )
    VALUES (
      NEW.id,
      auth.uid(),
      creator_email,
      'owner',
      'accepted',
      auth.uid(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Réactiver le trigger
CREATE TRIGGER auto_add_project_owner
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_project_creator_as_owner();
*/

-- =============================================
-- VÉRIFICATION
-- =============================================

-- Vérifier que les triggers sont bien supprimés
DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname = 'projects'
    AND t.tgname IN ('auto_add_project_owner', 'add_creator_as_owner_trigger');
    
  IF trigger_count > 0 THEN
    RAISE EXCEPTION 'Des triggers existent encore sur projects!';
  ELSE
    RAISE NOTICE '✅ Tous les triggers problématiques sont supprimés';
  END IF;
END $$;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE project_members IS 
'Membres et invitations des projets. Note: L''ajout automatique du créateur est désactivé (trigger supprimé). Les membres doivent être ajoutés manuellement via l''interface.';

