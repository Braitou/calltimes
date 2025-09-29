-- =============================================
-- CALL TIMES - Auto Organization Creation
-- =============================================

-- Fonction pour créer automatiquement une organisation et membership lors du signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
BEGIN
    -- Créer une nouvelle organisation pour le nouvel utilisateur
    INSERT INTO public.organizations (name)
    VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)) || '''s Studio')
    RETURNING id INTO new_org_id;

    -- Créer le membership avec le rôle owner
    INSERT INTO public.memberships (user_id, organization_id, role)
    VALUES (NEW.id, new_org_id, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modifier le trigger existant pour inclure la création d'organisation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Commentaire
COMMENT ON FUNCTION public.handle_new_user_signup() IS 'Auto-création user + organisation + membership owner lors du signup';
