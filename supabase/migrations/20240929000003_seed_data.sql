-- =============================================
-- CALL TIMES - Données de Test (Development)
-- =============================================

-- ⚠️  ATTENTION: Ces données sont pour le DÉVELOPPEMENT uniquement
-- Ne PAS exécuter en production !

-- =============================================
-- SEED ORGANIZATIONS
-- =============================================

INSERT INTO organizations (id, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Studio Production Paris'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Indie Films Collective'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Commercial Creator Agency');

-- =============================================
-- SEED USERS (Manual - normalement créés par Auth)
-- =============================================

-- NOTE: En production, ces users seraient créés via Supabase Auth
-- Ici on les crée manuellement pour les tests

INSERT INTO users (id, email, full_name) VALUES
    ('550e8400-e29b-41d4-a716-446655440101', 'simon@call-times.app', 'Simon Bandiera'),
    ('550e8400-e29b-41d4-a716-446655440102', 'marie@studio-paris.com', 'Marie Dubois'),
    ('550e8400-e29b-41d4-a716-446655440103', 'alex@indie-films.com', 'Alex Martin'),
    ('550e8400-e29b-41d4-a716-446655440104', 'laura@commercial-creator.com', 'Laura Johnson');

-- =============================================
-- SEED MEMBERSHIPS
-- =============================================

INSERT INTO memberships (user_id, organization_id, role) VALUES
    -- Simon = Owner Studio Production Paris
    ('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
    
    -- Marie = Admin Studio Production Paris
    ('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
    
    -- Alex = Owner Indie Films
    ('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
    
    -- Laura = Owner Commercial Creator
    ('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440003', 'owner');

-- =============================================
-- SEED PROJECTS
-- =============================================

INSERT INTO projects (id, organization_id, name, description, status) VALUES
    -- Projets Studio Production Paris
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Commercial Nike Air Max', 'Shooting commercial pour la nouvelle collection Nike Air Max. 2 jours de tournage en studio + extérieur.', 'active'),
    ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Shooting Mode Printemps', 'Campagne mode printemps-été 2025. Studio Harcourt + locations extérieures.', 'active'),
    ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', 'Clip Musical "Lumière"', 'Clip musical pour l\'artiste Emma. Concept urbain avec séquences nuit.', 'draft'),
    
    -- Projets Indie Films
    ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440002', 'Court-métrage "Solitude"', 'Court-métrage dramatique, 15 minutes. Tournage en appartement parisien.', 'active'),
    
    -- Projets Commercial Creator
    ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440003', 'Pub Automobile Renault', 'Commercial TV 30 secondes pour nouveau modèle Renault. Tournage route + studio.', 'active');

-- =============================================
-- SEED CONTACTS
-- =============================================

INSERT INTO contacts (organization_id, first_name, last_name, email, phone, department, role) VALUES
    -- Contacts Studio Production Paris
    ('550e8400-e29b-41d4-a716-446655440001', 'Pierre', 'Lambert', 'pierre.lambert@gmail.com', '+33 6 12 34 56 78', 'Réalisation', 'Réalisateur'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Sophie', 'Moreau', 'sophie.moreau@hotmail.com', '+33 6 23 45 67 89', 'Image', 'Directrice Photo'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Thomas', 'Bernard', 'thomas.bernard@gmail.com', '+33 6 34 56 78 90', 'Son', 'Ingénieur Son'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Julie', 'Petit', 'julie.petit@yahoo.fr', '+33 6 45 67 89 01', 'Maquillage', 'Maquilleuse'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Nicolas', 'Durand', 'nicolas.durand@gmail.com', '+33 6 56 78 90 12', 'Production', 'Assistant Réalisateur'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Emma', 'Roux', 'emma.roux@gmail.com', '+33 6 67 89 01 23', 'Casting', 'Actrice Principale'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Lucas', 'Blanc', 'lucas.blanc@gmail.com', '+33 6 78 90 12 34', 'Casting', 'Acteur Principal'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Camille', 'Noir', 'camille.noir@gmail.com', '+33 6 89 01 23 45', 'Technique', 'Électricien'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Antoine', 'Vert', 'antoine.vert@gmail.com', '+33 6 90 12 34 56', 'Technique', 'Machiniste'),
    ('550e8400-e29b-41d4-a716-446655440001', 'Léa', 'Rose', 'lea.rose@gmail.com', '+33 6 01 23 45 67', 'Coiffure', 'Coiffeuse'),

    -- Contacts Indie Films
    ('550e8400-e29b-41d4-a716-446655440002', 'Marc', 'Dubois', 'marc.dubois@gmail.com', '+33 6 11 22 33 44', 'Réalisation', 'Réalisateur'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Clara', 'Martin', 'clara.martin@gmail.com', '+33 6 22 33 44 55', 'Image', 'Cadreur'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Hugo', 'Leroy', 'hugo.leroy@gmail.com', '+33 6 33 44 55 66', 'Son', 'Preneur de Son'),

    -- Contacts Commercial Creator
    ('550e8400-e29b-41d4-a716-446655440003', 'Sarah', 'Johnson', 'sarah.johnson@gmail.com', '+33 6 44 55 66 77', 'Réalisation', 'Réalisatrice'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Mike', 'Smith', 'mike.smith@gmail.com', '+33 6 55 66 77 88', 'Image', 'Directeur Photo');

-- =============================================
-- SEED CALL SHEETS
-- =============================================

INSERT INTO call_sheets (id, project_id, organization_id, title, shoot_date, call_time, status, notes) VALUES
    -- Call Sheets Nike Air Max
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Nike Air Max - Jour 1', '2025-10-15', '07:00:00', 'sent', 'Premier jour de tournage en studio. Séquences produit et lifestyle.'),
    ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'Nike Air Max - Jour 2', '2025-10-16', '06:30:00', 'draft', 'Deuxième jour, tournage extérieur. Location parc urbain.'),
    
    -- Call Sheets Mode Printemps
    ('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'Mode Printemps - Studio', '2025-10-20', '08:00:00', 'draft', 'Shooting studio avec 3 mannequins. Collection printemps-été.');

-- =============================================
-- SEED CALL SHEET LOCATIONS
-- =============================================

INSERT INTO call_sheet_locations (call_sheet_id, name, address, type, notes, sort_order) VALUES
    -- Locations Nike Jour 1
    ('550e8400-e29b-41d4-a716-446655440301', 'Studio Harcourt', '6 Rue de Lota, 75116 Paris', 'main', 'Plateau principal, 3 cyclos disponibles', 1),
    ('550e8400-e29b-41d4-a716-446655440301', 'Base Camp', 'Rue adjacente au studio', 'base_camp', 'Loges artistes et équipe technique', 2),
    ('550e8400-e29b-41d4-a716-446655440301', 'Parking Équipe', '8 Rue de Lota, 75116 Paris', 'parking', 'Parking privé pour véhicules techniques', 3),

    -- Locations Nike Jour 2
    ('550e8400-e29b-41d4-a716-446655440302', 'Parc André Citroën', 'Quai André Citroën, 75015 Paris', 'main', 'Zone autorisée secteur nord, près de la Seine', 1),
    ('550e8400-e29b-41d4-a716-446655440302', 'Catering Truck', 'Parking Parc André Citroën', 'base_camp', 'Food truck + tables équipe', 2);

-- =============================================
-- SEED CALL SHEET SCHEDULE
-- =============================================

INSERT INTO call_sheet_schedule (call_sheet_id, time, activity, location, notes, sort_order) VALUES
    -- Planning Nike Jour 1
    ('550e8400-e29b-41d4-a716-446655440301', '07:00:00', 'Petit-déjeuner équipe', 'Base Camp', 'Accueil avec viennoiseries et café', 1),
    ('550e8400-e29b-41d4-a716-446655440301', '07:30:00', 'Installation technique', 'Studio Principal', 'Mise en place éclairage et caméras', 2),
    ('550e8400-e29b-41d4-a716-446655440301', '08:30:00', 'Arrivée talent principal', 'Base Camp', 'Accueil + briefing', 3),
    ('550e8400-e29b-41d4-a716-446655440301', '09:00:00', 'Maquillage / Coiffure', 'Loge 1', 'Look principal campaign', 4),
    ('550e8400-e29b-41d4-a716-446655440301', '10:00:00', 'Répétitions', 'Studio Principal', 'Blocking et ajustements technique', 5),
    ('550e8400-e29b-41d4-a716-446655440301', '10:30:00', 'TOURNAGE Setup 1', 'Studio Principal', 'Séquences produit sur cyclo blanc', 6),
    ('550e8400-e29b-41d4-a716-446655440301', '12:30:00', 'Pause déjeuner', 'Base Camp', 'Catering équipe complète', 7),
    ('550e8400-e29b-41d4-a716-446655440301', '13:30:00', 'TOURNAGE Setup 2', 'Studio Principal', 'Séquences lifestyle avec décor', 8),
    ('550e8400-e29b-41d4-a716-446655440301', '16:00:00', 'Changement look', 'Loge 1', 'Nouvelle tenue + retouches', 9),
    ('550e8400-e29b-41d4-a716-446655440301', '16:30:00', 'TOURNAGE Setup 3', 'Studio Principal', 'Séquences finales mouvement', 10),
    ('550e8400-e29b-41d4-a716-446655440301', '18:00:00', 'Wrap et rangement', 'Studio Principal', 'Démontage matériel', 11);

-- =============================================
-- SEED CALL SHEET TEAM ROWS
-- =============================================

INSERT INTO call_sheet_team_rows (call_sheet_id, contact_id, name, role, department, call_time, notes, sort_order) VALUES
    -- Équipe Nike Jour 1
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440101', 'Pierre Lambert', 'Réalisateur', 'Réalisation', '07:00:00', 'Briefing client 6h45', 1),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440102', 'Sophie Moreau', 'Directrice Photo', 'Image', '07:00:00', 'Check matériel caméra', 2),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440103', 'Thomas Bernard', 'Ingénieur Son', 'Son', '07:30:00', 'HF + perche pour interviews', 3),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440104', 'Julie Petit', 'Maquilleuse', 'Maquillage', '08:00:00', 'Look naturel brand Nike', 4),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440105', 'Nicolas Durand', '1er Assistant', 'Production', '07:00:00', 'Coordination générale', 5),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440106', 'Emma Roux', 'Talent Principal', 'Casting', '08:30:00', 'Fitting terminé vendredi', 6),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440107', 'Camille Noir', 'Électricien', 'Technique', '07:00:00', 'Setup 3 HMI + LED panel', 7),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440108', 'Antoine Vert', 'Machiniste', 'Technique', '07:00:00', 'Steadycam + rails disponibles', 8),
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440109', 'Léa Rose', 'Coiffeuse', 'Coiffure', '08:00:00', 'Look sport-chic Nike', 9),
    
    -- Contact externe (freelance) sans ID contact
    ('550e8400-e29b-41d4-a716-446655440301', NULL, 'Jean-Michel Drone', 'Pilote Drone', 'Image', '09:00:00', 'Drone autorisé en intérieur', 10);

-- =============================================
-- SEED EMAIL JOBS (Exemples d'envois)
-- =============================================

INSERT INTO email_jobs (id, call_sheet_id, status, sent_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 'sent', '2025-10-10 14:30:00+01'),
    ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440302', 'pending', NULL);

-- =============================================
-- SEED EMAIL RECIPIENTS
-- =============================================

INSERT INTO email_recipients (email_job_id, contact_id, email, name, status, sent_at) VALUES
    -- Destinataires envoi Nike Jour 1
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440101', 'pierre.lambert@gmail.com', 'Pierre Lambert', 'sent', '2025-10-10 14:30:15+01'),
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440102', 'sophie.moreau@hotmail.com', 'Sophie Moreau', 'sent', '2025-10-10 14:30:16+01'),
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440103', 'thomas.bernard@gmail.com', 'Thomas Bernard', 'sent', '2025-10-10 14:30:17+01'),
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440104', 'julie.petit@yahoo.fr', 'Julie Petit', 'sent', '2025-10-10 14:30:18+01'),
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440106', 'emma.roux@gmail.com', 'Emma Roux', 'sent', '2025-10-10 14:30:19+01'),
    
    -- Email externe (client Nike)
    ('550e8400-e29b-41d4-a716-446655440401', NULL, 'client.nike@nike.com', 'Nike Creative Team', 'sent', '2025-10-10 14:30:20+01');

-- =============================================
-- COMMIT et COMMENTAIRES
-- =============================================

-- Mise à jour des compteurs de séquences pour éviter les conflits
SELECT setval('organizations_id_seq', 1000, true);
SELECT setval('projects_id_seq', 1000, true);
SELECT setval('contacts_id_seq', 1000, true);
SELECT setval('call_sheets_id_seq', 1000, true);

-- Commentaires pour documentation
COMMENT ON TABLE organizations IS 'Données de test: 3 organisations types (Studio, Indie, Commercial)';
COMMENT ON TABLE users IS 'Données de test: 4 utilisateurs avec rôles différents';
COMMENT ON TABLE projects IS 'Données de test: 5 projets variés (commercial, mode, clip, court-métrage)';
COMMENT ON TABLE contacts IS 'Données de test: 15 contacts avec tous les départements types';
COMMENT ON TABLE call_sheets IS 'Données de test: 3 call sheets avec statuts différents';

-- =============================================
-- VÉRIFICATIONS (Queries de test)
-- =============================================

-- Vérifier que les organizations ont des membres
DO $$
DECLARE
    org_count INTEGER;
    member_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO member_count FROM memberships;
    
    RAISE NOTICE 'Organisations créées: %', org_count;
    RAISE NOTICE 'Memberships créés: %', member_count;
    
    IF org_count = 0 OR member_count = 0 THEN
        RAISE EXCEPTION 'Erreur dans les données de test: pas d''organisations ou de membres';
    END IF;
END $$;
