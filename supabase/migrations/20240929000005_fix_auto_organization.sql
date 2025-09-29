-- =============================================
-- CALL TIMES - Fix Auto Organization Creation
-- =============================================

-- Supprimer l'ancien trigger problématique
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Fonction pour créer automatiquement un user lors du signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer l'entrée user dans public.users
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction séparée pour créer l'organisation après création du user
CREATE OR REPLACE FUNCTION public.create_user_organization(user_id UUID, user_email TEXT, user_name TEXT DEFAULT '')
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
    org_name TEXT;
BEGIN
    -- Créer le nom de l'organisation
    IF user_name IS NOT NULL AND user_name != '' THEN
        org_name := user_name || ' Studio';
    ELSE
        org_name := split_part(user_email, '@', 1) || ' Studio';
    END IF;
    
    -- Créer l'organisation
    INSERT INTO public.organizations (name)
    VALUES (org_name)
    RETURNING id INTO new_org_id;
    
    -- Créer le membership owner
    INSERT INTO public.memberships (user_id, organization_id, role)
    VALUES (user_id, new_org_id, 'owner');
    
    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger simple pour les users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Commentaires
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-création user dans public.users lors du signup Supabase';
COMMENT ON FUNCTION public.create_user_organization(UUID, TEXT, TEXT) IS 'Fonction manuelle pour créer organisation + membership après signup';
