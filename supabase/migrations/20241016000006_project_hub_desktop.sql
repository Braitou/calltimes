-- Migration pour le Project Hub Desktop
-- Ajoute les positions pour drag & drop et crée la table des dossiers
-- =============================================

-- 1. Ajouter les colonnes de position aux fichiers existants
ALTER TABLE project_files
ADD COLUMN position_x INTEGER DEFAULT 0,
ADD COLUMN position_y INTEGER DEFAULT 0,
ADD COLUMN folder_id UUID REFERENCES project_folders(id) ON DELETE SET NULL;

-- 2. Créer la table des dossiers
CREATE TABLE project_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'yellow',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Index pour performances
CREATE INDEX idx_project_folders_project_id ON project_folders(project_id);
CREATE INDEX idx_project_folders_organization_id ON project_folders(organization_id);
CREATE INDEX idx_project_files_folder_id ON project_files(folder_id);

-- 4. Trigger pour updated_at
CREATE TRIGGER update_project_folders_updated_at
    BEFORE UPDATE ON project_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES: project_folders
-- =============================================

-- Enable RLS
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir les dossiers de leurs projets
CREATE POLICY "project_folders_can_be_viewed_by_project_members"
    ON project_folders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_folders.project_id
                AND pm.user_id = auth.uid()
                AND pm.invitation_status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_folders.project_id
                AND p.organization_id IN (
                    SELECT organization_id FROM memberships
                    WHERE user_id = auth.uid()
                )
        )
    );

-- Policy: Les membres du projet peuvent créer des dossiers
CREATE POLICY "project_folders_can_be_created_by_project_members"
    ON project_folders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_folders.project_id
                AND pm.user_id = auth.uid()
                AND pm.invitation_status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_folders.project_id
                AND p.organization_id IN (
                    SELECT organization_id FROM memberships
                    WHERE user_id = auth.uid()
                )
        )
    );

-- Policy: Les membres du projet peuvent modifier les dossiers
CREATE POLICY "project_folders_can_be_updated_by_project_members"
    ON project_folders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_folders.project_id
                AND pm.user_id = auth.uid()
                AND pm.invitation_status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_folders.project_id
                AND p.organization_id IN (
                    SELECT organization_id FROM memberships
                    WHERE user_id = auth.uid()
                )
        )
    );

-- Policy: Les membres du projet peuvent supprimer les dossiers
CREATE POLICY "project_folders_can_be_deleted_by_project_members"
    ON project_folders
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_folders.project_id
                AND pm.user_id = auth.uid()
                AND pm.invitation_status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_folders.project_id
                AND p.organization_id IN (
                    SELECT organization_id FROM memberships
                    WHERE user_id = auth.uid()
                )
        )
    );

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE project_folders IS 'Dossiers virtuels pour organiser les fichiers dans le Project Hub';
COMMENT ON COLUMN project_folders.position_x IS 'Position X sur le canvas (drag & drop)';
COMMENT ON COLUMN project_folders.position_y IS 'Position Y sur le canvas (drag & drop)';
COMMENT ON COLUMN project_folders.color IS 'Couleur du dossier (yellow, blue, red, etc.)';

COMMENT ON COLUMN project_files.position_x IS 'Position X sur le canvas (drag & drop)';
COMMENT ON COLUMN project_files.position_y IS 'Position Y sur le canvas (drag & drop)';
COMMENT ON COLUMN project_files.folder_id IS 'Dossier parent (NULL si à la racine)';

