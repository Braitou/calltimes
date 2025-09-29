-- =============================================
-- CALL TIMES - Cleanup Problematic Triggers
-- =============================================

-- Supprimer tous les triggers qui causent des erreurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_organization(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.add_user_to_dev_org(UUID);

-- Supprimer l'organisation de test si elle existe
DELETE FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001';

-- Fonction simple pour créer un user dans public.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger simple et sûr
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Commentaire
COMMENT ON FUNCTION public.handle_new_user() IS 'Synchronisation simple auth.users → public.users (sans organisation)';
