-- =============================================
-- PHASE 5: PROJECT HUB & COLLABORATION
-- Migration: Tables pour file management et invitations
-- Date: 2024-10-09
-- =============================================

-- =============================================
-- TABLE: project_files
-- Stockage des métadonnées des fichiers uploadés
-- =============================================
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Chemin dans Supabase Storage
  file_type TEXT NOT NULL, -- image, pdf, document, video, audio, other
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- En bytes
  folder_path TEXT DEFAULT '/', -- Pour organisation par dossiers
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_folder_path ON project_files(project_id, folder_path);
CREATE INDEX idx_project_files_uploaded_by ON project_files(uploaded_by);

-- Trigger pour updated_at
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TABLE: project_members
-- Gestion des membres et invitations
-- =============================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL si invitation pending
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invitation_token UUID DEFAULT gen_random_uuid(),
  invitation_status TEXT DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'accepted', 'expired')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte: un email par projet
  UNIQUE(project_id, email)
);

-- Index pour performance
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_invitation_token ON project_members(invitation_token);
CREATE INDEX idx_project_members_email ON project_members(email);

-- Trigger pour updated_at
CREATE TRIGGER update_project_members_updated_at
  BEFORE UPDATE ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES: project_files
-- =============================================

-- Enable RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Policy: Les membres du projet peuvent voir les fichiers
CREATE POLICY "project_members_can_view_files"
  ON project_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
        AND pm.user_id = auth.uid()
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_files.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Les editors et owners peuvent uploader des fichiers
CREATE POLICY "editors_can_upload_files"
  ON project_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
        AND pm.user_id = auth.uid()
        AND pm.role IN ('owner', 'editor')
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_files.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Les editors et owners peuvent supprimer des fichiers
CREATE POLICY "editors_can_delete_files"
  ON project_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
        AND pm.user_id = auth.uid()
        AND pm.role IN ('owner', 'editor')
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_files.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Les editors et owners peuvent modifier des fichiers (renommer, déplacer)
CREATE POLICY "editors_can_update_files"
  ON project_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_files.project_id
        AND pm.user_id = auth.uid()
        AND pm.role IN ('owner', 'editor')
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_files.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- =============================================
-- RLS POLICIES: project_members
-- =============================================

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Policy: Les membres peuvent voir les autres membres
CREATE POLICY "members_can_view_members"
  ON project_members
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
        AND invitation_status = 'accepted'
    )
    OR
    project_id IN (
      SELECT id FROM projects
      WHERE organization_id IN (
        SELECT organization_id FROM memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Les owners peuvent inviter des membres
CREATE POLICY "owners_can_invite_members"
  ON project_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Les owners peuvent modifier les membres (changer role)
CREATE POLICY "owners_can_update_members"
  ON project_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Les owners peuvent supprimer des membres
CREATE POLICY "owners_can_remove_members"
  ON project_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.role = 'owner'
        AND pm.invitation_status = 'accepted'
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND p.organization_id IN (
          SELECT organization_id FROM memberships
          WHERE user_id = auth.uid()
        )
    )
  );

-- =============================================
-- FUNCTION: Auto-ajouter le créateur comme owner
-- =============================================
CREATE OR REPLACE FUNCTION add_project_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
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
    NEW.created_by,
    (SELECT email FROM auth.users WHERE id = NEW.created_by),
    'owner',
    'accepted',
    NEW.created_by,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Ajouter automatiquement le créateur comme owner
CREATE TRIGGER auto_add_project_owner
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_project_creator_as_owner();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE project_files IS 'Métadonnées des fichiers uploadés dans les projets';
COMMENT ON TABLE project_members IS 'Membres et invitations des projets avec système de permissions';
COMMENT ON COLUMN project_members.role IS 'owner: full access, editor: upload/delete, viewer: read-only';
COMMENT ON COLUMN project_members.invitation_status IS 'pending: en attente, accepted: accepté, expired: expiré';


