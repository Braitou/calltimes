-- =============================================
-- ENHANCEMENT: Call Sheets pour Project Hub
-- =============================================
-- Ajouter les colonnes manquantes pour stocker
-- toutes les données de l'éditeur de Call Sheets
-- =============================================

-- Ajouter les colonnes pour les logos
ALTER TABLE call_sheets
ADD COLUMN IF NOT EXISTS logo_production_url TEXT,
ADD COLUMN IF NOT EXISTS logo_marque_url TEXT,
ADD COLUMN IF NOT EXISTS logo_agence_url TEXT;

-- Ajouter une colonne pour stocker les données JSON de l'éditeur
-- (contacts importants, équipe, schedule complet)
ALTER TABLE call_sheets
ADD COLUMN IF NOT EXISTS editor_data JSONB DEFAULT '{}'::jsonb;

-- Rendre shoot_date et call_time optionnels (peuvent être vides au départ)
ALTER TABLE call_sheets
ALTER COLUMN shoot_date DROP NOT NULL,
ALTER COLUMN call_time DROP NOT NULL;

-- Ajouter un index sur project_id pour performance
CREATE INDEX IF NOT EXISTS idx_call_sheets_project_id ON call_sheets(project_id);

-- Ajouter un index sur status
CREATE INDEX IF NOT EXISTS idx_call_sheets_status ON call_sheets(status);

-- =============================================
-- RLS POLICIES pour call_sheets
-- =============================================

-- Enable RLS si pas déjà fait
ALTER TABLE call_sheets ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir les call sheets de leur organization
DROP POLICY IF EXISTS "Users can view organization call sheets" ON call_sheets;
CREATE POLICY "Users can view organization call sheets"
ON call_sheets
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Les utilisateurs peuvent créer des call sheets dans leur organization
DROP POLICY IF EXISTS "Users can create call sheets in their organization" ON call_sheets;
CREATE POLICY "Users can create call sheets in their organization"
ON call_sheets
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Les utilisateurs peuvent modifier les call sheets de leur organization
DROP POLICY IF EXISTS "Users can update organization call sheets" ON call_sheets;
CREATE POLICY "Users can update organization call sheets"
ON call_sheets
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- Policy: Les utilisateurs peuvent supprimer les call sheets de leur organization
DROP POLICY IF EXISTS "Users can delete organization call sheets" ON call_sheets;
CREATE POLICY "Users can delete organization call sheets"
ON call_sheets
FOR DELETE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM memberships 
    WHERE user_id = auth.uid()
  )
);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN call_sheets.editor_data IS 
'Stocke les données complètes de l''éditeur en JSON: 
{
  "locations": [...],
  "important_contacts": [...],
  "schedule": [...],
  "team": [...]
}';

COMMENT ON COLUMN call_sheets.logo_production_url IS 'URL du logo de production (Supabase Storage)';
COMMENT ON COLUMN call_sheets.logo_marque_url IS 'URL du logo de la marque (Supabase Storage)';
COMMENT ON COLUMN call_sheets.logo_agence_url IS 'URL du logo de l''agence (Supabase Storage)';

-- =============================================
-- VÉRIFICATION
-- =============================================

DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'call_sheets'
    AND column_name IN ('logo_production_url', 'logo_marque_url', 'logo_agence_url', 'editor_data');
    
  IF col_count = 4 THEN
    RAISE NOTICE '✅ Call sheets table enhanced successfully';
  ELSE
    RAISE EXCEPTION 'Expected 4 new columns, found %', col_count;
  END IF;
END $$;

