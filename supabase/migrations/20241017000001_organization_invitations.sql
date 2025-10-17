-- =============================================
-- CALL TIMES - Organization Invitations
-- =============================================
-- Migration pour le système d'invitations organisation
-- Permet à Victor d'inviter Simon à rejoindre l'org

-- =============================================
-- TABLE: organization_invitations
-- =============================================

CREATE TABLE organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    invitation_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEX pour performance
-- =============================================

CREATE INDEX idx_org_invitations_token ON organization_invitations(invitation_token);
CREATE INDEX idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX idx_org_invitations_status ON organization_invitations(status);

-- Index UNIQUE partiel : empêche 2 invitations pending pour même email dans une org
-- Mais autorise revoked/expired/accepted + nouvelle pending
CREATE UNIQUE INDEX idx_org_invitations_unique_pending 
ON organization_invitations(organization_id, email) 
WHERE status = 'pending';

-- =============================================
-- RLS (Row Level Security)
-- =============================================

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Les membres d'une org peuvent voir les invitations de leur org
CREATE POLICY "org_members_can_view_invitations" ON organization_invitations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid()
        )
    );

-- Les owners peuvent créer des invitations
CREATE POLICY "org_owners_can_create_invitations" ON organization_invitations
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- Les owners peuvent révoquer des invitations
CREATE POLICY "org_owners_can_update_invitations" ON organization_invitations
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id 
            FROM memberships 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- Tout le monde peut lire sa propre invitation (via token)
CREATE POLICY "anyone_can_view_their_invitation_by_token" ON organization_invitations
    FOR SELECT USING (
        invitation_token IS NOT NULL
    );

-- =============================================
-- FONCTION: Auto-expiration des invitations
-- =============================================

CREATE OR REPLACE FUNCTION expire_old_organization_invitations()
RETURNS void AS $$
BEGIN
    UPDATE organization_invitations
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER: Vérifier limite 20 membres par org
-- =============================================

CREATE OR REPLACE FUNCTION check_organization_member_limit()
RETURNS TRIGGER AS $$
DECLARE
    member_count INTEGER;
BEGIN
    -- Compter les membres actuels + invitations pending
    SELECT COUNT(*) INTO member_count
    FROM (
        SELECT user_id FROM memberships WHERE organization_id = NEW.organization_id
        UNION ALL
        SELECT id FROM organization_invitations 
        WHERE organization_id = NEW.organization_id 
        AND status = 'pending'
    ) AS total_members;
    
    -- Limite à 20
    IF member_count >= 20 THEN
        RAISE EXCEPTION 'Organization member limit reached (max 20 members)';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_member_limit
    BEFORE INSERT ON organization_invitations
    FOR EACH ROW
    EXECUTE FUNCTION check_organization_member_limit();

-- =============================================
-- COMMENTAIRES pour documentation
-- =============================================

COMMENT ON TABLE organization_invitations IS 'Invitations pour rejoindre une organisation (Victor invite Simon)';
COMMENT ON COLUMN organization_invitations.role IS 'Rôle proposé: owner ou member';
COMMENT ON COLUMN organization_invitations.invitation_token IS 'Token unique pour le lien magique';
COMMENT ON COLUMN organization_invitations.expires_at IS 'Expiration automatique après 7 jours';

