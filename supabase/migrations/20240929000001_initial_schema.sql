-- =============================================
-- CALL TIMES - Schema Initial
-- =============================================

-- Extension UUID pour les clés primaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les fonctions de date/heure
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- =============================================
-- TABLES CORE
-- =============================================

-- Table Organizations (Multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Users (Auth intégrée avec Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Memberships (Liaison User-Organization)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Table Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Contacts (Répertoire équipe)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    department VARCHAR(100),
    role VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLES CALL SHEETS
-- =============================================

-- Table Call Sheets principale
CREATE TABLE call_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    shoot_date DATE NOT NULL,
    call_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
    notes TEXT,
    pdf_url TEXT, -- URL vers le PDF généré
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Call Sheet Locations (Lieux de tournage)
CREATE TABLE call_sheet_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sheet_id UUID NOT NULL REFERENCES call_sheets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('main', 'base_camp', 'parking', 'holding')),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Table Call Sheet Schedule (Planning détaillé)
CREATE TABLE call_sheet_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sheet_id UUID NOT NULL REFERENCES call_sheets(id) ON DELETE CASCADE,
    time TIME NOT NULL,
    activity VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Table Call Sheet Team Rows (Équipe par call sheet)
CREATE TABLE call_sheet_team_rows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sheet_id UUID NOT NULL REFERENCES call_sheets(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Peut être null si contact externe
    name VARCHAR(255) NOT NULL, -- Nom affiché (peut différer du contact)
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    call_time TIME,
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- TABLES EMAIL SYSTEM
-- =============================================

-- Table Email Jobs (Envois d'emails)
CREATE TABLE email_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sheet_id UUID NOT NULL REFERENCES call_sheets(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table Email Recipients (Destinataires par envoi)
CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_job_id UUID NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Peut être null si email externe
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- =============================================
-- INDEXES pour performance
-- =============================================

-- Index pour les requêtes courantes
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_org_id ON memberships(organization_id);
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX idx_call_sheets_project_id ON call_sheets(project_id);
CREATE INDEX idx_call_sheets_org_id ON call_sheets(organization_id);
CREATE INDEX idx_call_sheet_locations_call_sheet_id ON call_sheet_locations(call_sheet_id);
CREATE INDEX idx_call_sheet_schedule_call_sheet_id ON call_sheet_schedule(call_sheet_id);
CREATE INDEX idx_call_sheet_team_rows_call_sheet_id ON call_sheet_team_rows(call_sheet_id);
CREATE INDEX idx_email_jobs_call_sheet_id ON email_jobs(call_sheet_id);
CREATE INDEX idx_email_recipients_job_id ON email_recipients(email_job_id);

-- Index composites pour les recherches
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_call_sheets_status_date ON call_sheets(status, shoot_date);

-- =============================================
-- TRIGGERS pour updated_at
-- =============================================

-- Fonction générique pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers sur les tables avec updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_call_sheets_updated_at BEFORE UPDATE ON call_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour récupérer l'organization_id de l'utilisateur actuel
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT organization_id 
        FROM memberships 
        WHERE user_id = auth.uid() 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur appartient à une organisation
CREATE OR REPLACE FUNCTION user_belongs_to_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 
        FROM memberships 
        WHERE user_id = auth.uid() 
        AND organization_id = org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
