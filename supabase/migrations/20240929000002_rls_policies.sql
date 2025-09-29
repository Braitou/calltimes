-- =============================================
-- CALL TIMES - Row Level Security (RLS) Policies
-- =============================================

-- =============================================
-- ACTIVATION RLS sur toutes les tables
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheet_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheet_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sheet_team_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES ORGANIZATIONS
-- =============================================

-- Les utilisateurs ne peuvent voir que les organisations auxquelles ils appartiennent
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid()
        )
    );

-- Seuls les owners peuvent modifier leur organisation
CREATE POLICY "Owners can update their organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- =============================================
-- POLICIES USERS
-- =============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Insertion automatique lors de la création du compte (trigger)
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- =============================================
-- POLICIES MEMBERSHIPS
-- =============================================

-- Les utilisateurs peuvent voir les memberships de leurs organisations
CREATE POLICY "Users can view organization memberships" ON memberships
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid()
        )
    );

-- Seuls les owners/admins peuvent gérer les memberships
CREATE POLICY "Owners and admins can manage memberships" ON memberships
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- =============================================
-- POLICIES PROJECTS
-- =============================================

-- Les utilisateurs ne peuvent voir que les projets de leur organisation
CREATE POLICY "Users can view organization projects" ON projects
    FOR SELECT USING (user_belongs_to_organization(organization_id));

-- Les utilisateurs peuvent créer des projets dans leur organisation
CREATE POLICY "Users can create projects in their organization" ON projects
    FOR INSERT WITH CHECK (user_belongs_to_organization(organization_id));

-- Les utilisateurs peuvent modifier les projets de leur organisation
CREATE POLICY "Users can update organization projects" ON projects
    FOR UPDATE USING (user_belongs_to_organization(organization_id));

-- Seuls les owners/admins peuvent supprimer des projets
CREATE POLICY "Owners and admins can delete projects" ON projects
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- =============================================
-- POLICIES CONTACTS
-- =============================================

-- Les utilisateurs ne peuvent voir que les contacts de leur organisation
CREATE POLICY "Users can view organization contacts" ON contacts
    FOR SELECT USING (user_belongs_to_organization(organization_id));

-- Les utilisateurs peuvent créer/modifier des contacts dans leur organisation
CREATE POLICY "Users can manage organization contacts" ON contacts
    FOR ALL USING (user_belongs_to_organization(organization_id))
    WITH CHECK (user_belongs_to_organization(organization_id));

-- =============================================
-- POLICIES CALL SHEETS
-- =============================================

-- Les utilisateurs ne peuvent voir que les call sheets de leur organisation
CREATE POLICY "Users can view organization call sheets" ON call_sheets
    FOR SELECT USING (user_belongs_to_organization(organization_id));

-- Les utilisateurs peuvent créer/modifier des call sheets dans leur organisation
CREATE POLICY "Users can manage organization call sheets" ON call_sheets
    FOR ALL USING (user_belongs_to_organization(organization_id))
    WITH CHECK (user_belongs_to_organization(organization_id));

-- =============================================
-- POLICIES CALL SHEET LOCATIONS
-- =============================================

-- Les utilisateurs peuvent gérer les locations des call sheets de leur organisation
CREATE POLICY "Users can manage call sheet locations" ON call_sheet_locations
    FOR ALL USING (
        call_sheet_id IN (
            SELECT id 
            FROM call_sheets 
            WHERE user_belongs_to_organization(organization_id)
        )
    );

-- =============================================
-- POLICIES CALL SHEET SCHEDULE
-- =============================================

-- Les utilisateurs peuvent gérer le planning des call sheets de leur organisation
CREATE POLICY "Users can manage call sheet schedule" ON call_sheet_schedule
    FOR ALL USING (
        call_sheet_id IN (
            SELECT id 
            FROM call_sheets 
            WHERE user_belongs_to_organization(organization_id)
        )
    );

-- =============================================
-- POLICIES CALL SHEET TEAM ROWS
-- =============================================

-- Les utilisateurs peuvent gérer l'équipe des call sheets de leur organisation
CREATE POLICY "Users can manage call sheet team" ON call_sheet_team_rows
    FOR ALL USING (
        call_sheet_id IN (
            SELECT id 
            FROM call_sheets 
            WHERE user_belongs_to_organization(organization_id)
        )
    );

-- =============================================
-- POLICIES EMAIL JOBS
-- =============================================

-- Les utilisateurs peuvent voir les jobs d'email de leur organisation
CREATE POLICY "Users can view organization email jobs" ON email_jobs
    FOR SELECT USING (
        call_sheet_id IN (
            SELECT id 
            FROM call_sheets 
            WHERE user_belongs_to_organization(organization_id)
        )
    );

-- Les utilisateurs peuvent créer des jobs d'email pour leur organisation
CREATE POLICY "Users can create email jobs" ON email_jobs
    FOR INSERT WITH CHECK (
        call_sheet_id IN (
            SELECT id 
            FROM call_sheets 
            WHERE user_belongs_to_organization(organization_id)
        )
    );

-- Seul le système peut mettre à jour le statut des jobs (via service workers)
CREATE POLICY "System can update email job status" ON email_jobs
    FOR UPDATE USING (true); -- TODO: Restreindre aux service roles

-- =============================================
-- POLICIES EMAIL RECIPIENTS
-- =============================================

-- Les utilisateurs peuvent voir les destinataires de leur organisation
CREATE POLICY "Users can view email recipients" ON email_recipients
    FOR SELECT USING (
        email_job_id IN (
            SELECT ej.id 
            FROM email_jobs ej
            JOIN call_sheets cs ON ej.call_sheet_id = cs.id
            WHERE user_belongs_to_organization(cs.organization_id)
        )
    );

-- Les utilisateurs peuvent créer des destinataires pour leur organisation
CREATE POLICY "Users can create email recipients" ON email_recipients
    FOR INSERT WITH CHECK (
        email_job_id IN (
            SELECT ej.id 
            FROM email_jobs ej
            JOIN call_sheets cs ON ej.call_sheet_id = cs.id
            WHERE user_belongs_to_organization(cs.organization_id)
        )
    );

-- Seul le système peut mettre à jour le statut des destinataires
CREATE POLICY "System can update recipient status" ON email_recipients
    FOR UPDATE USING (true); -- TODO: Restreindre aux service roles

-- =============================================
-- TRIGGER pour auto-insertion users
-- =============================================

-- Fonction pour créer automatiquement un user lors du signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users pour auto-création
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- COMMENTAIRES pour documentation
-- =============================================

COMMENT ON POLICY "Users can view their organizations" ON organizations IS 'Multi-tenant: utilisateurs voient seulement leurs orgs';
COMMENT ON POLICY "Users can view organization projects" ON projects IS 'Multi-tenant: projets isolés par organisation';
COMMENT ON POLICY "Users can view organization contacts" ON contacts IS 'Multi-tenant: contacts isolés par organisation';
COMMENT ON POLICY "Users can view organization call sheets" ON call_sheets IS 'Multi-tenant: call sheets isolées par organisation';
COMMENT ON FUNCTION get_user_organization_id() IS 'Helper function: récupère org_id de l''utilisateur actuel';
COMMENT ON FUNCTION user_belongs_to_organization(UUID) IS 'Helper function: vérifie appartenance à une organisation';
