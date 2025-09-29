-- =============================================
-- CALL TIMES - Simple Fix (Disable Auto Org)
-- =============================================

-- Supprimer tous les triggers problématiques
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Fonction simple pour juste créer le user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger simple
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Créer une organisation de test
INSERT INTO organizations (id, name) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Studio de Développement');

-- Fonction pour ajouter un user à l'organisation de test
CREATE OR REPLACE FUNCTION public.add_user_to_dev_org(user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO memberships (user_id, organization_id, role)
    VALUES (user_id, '00000000-0000-0000-0000-000000000001', 'owner')
    ON CONFLICT (user_id, organization_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
