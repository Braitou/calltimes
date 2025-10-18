-- =============================================
-- FIX: Contrainte UNIQUE sur organization_invitations
-- =============================================
-- Problème : La contrainte UNIQUE(org_id, email, status) empêche
-- de révoquer puis réinviter la même personne
--
-- Solution : Index UNIQUE partiel (seulement pour status = 'pending')
-- =============================================

-- 1. Supprimer l'ancienne contrainte UNIQUE (si elle existe)
ALTER TABLE organization_invitations 
DROP CONSTRAINT IF EXISTS organization_invitations_organization_id_email_status_key;

-- 2. Créer un index UNIQUE partiel
-- Empêche 2 invitations 'pending' pour le même email dans une org
-- Mais autorise: revoked + pending, expired + pending, accepted + pending
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_invitations_unique_pending 
ON organization_invitations(organization_id, email) 
WHERE status = 'pending';

-- =============================================
-- Vérification
-- =============================================

-- Cette requête doit retourner 1 ligne (l'index créé)
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'organization_invitations' 
AND indexname = 'idx_org_invitations_unique_pending';

-- =============================================
-- Test manuel (optionnel)
-- =============================================

-- Après avoir exécuté ce script, tu peux tester :
-- 1. Créer une invitation pending pour simon@gmail.com → OK
-- 2. Essayer d'en créer une 2ème pending pour simon@gmail.com → ERREUR (normal)
-- 3. Révoquer la 1ère → OK
-- 4. Créer une nouvelle pending pour simon@gmail.com → OK (maintenant ça marche !)

