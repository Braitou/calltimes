-- ====================================
-- SUPABASE STORAGE SETUP
-- ====================================
-- Création des buckets et policies pour le stockage des fichiers

-- Créer les buckets storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'org-logos', 
    'org-logos', 
    false, 
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
  ),
  (
    'project-assets', 
    'project-assets', 
    false, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']::text[]
  ),
  (
    'pdfs', 
    'pdfs', 
    false, 
    10485760, -- 10MB limit
    ARRAY['application/pdf']::text[]
  )
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- POLICIES POUR ORG-LOGOS
-- ====================================

-- Permettre aux utilisateurs de voir les logos de leur organisation
CREATE POLICY "Users can view org logos" ON storage.objects FOR SELECT
USING (
  bucket_id = 'org-logos' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Permettre aux utilisateurs d'uploader des logos pour leur organisation
CREATE POLICY "Users can upload org logos" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'org-logos' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
  AND auth.role() = 'authenticated'
);

-- Permettre aux utilisateurs de modifier les logos de leur organisation
CREATE POLICY "Users can update org logos" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'org-logos' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
)
WITH CHECK (
  bucket_id = 'org-logos' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Permettre aux utilisateurs de supprimer les logos de leur organisation
CREATE POLICY "Users can delete org logos" ON storage.objects FOR DELETE
USING (
  bucket_id = 'org-logos' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- ====================================
-- POLICIES POUR PROJECT-ASSETS
-- ====================================

-- Permettre aux utilisateurs de voir les assets de leur organisation
CREATE POLICY "Users can view project assets" ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-assets' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Permettre aux utilisateurs d'uploader des assets pour leur organisation
CREATE POLICY "Users can upload project assets" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-assets' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
  AND auth.role() = 'authenticated'
);

-- Permettre aux utilisateurs de modifier les assets de leur organisation
CREATE POLICY "Users can update project assets" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-assets' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
)
WITH CHECK (
  bucket_id = 'project-assets' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Permettre aux utilisateurs de supprimer les assets de leur organisation
CREATE POLICY "Users can delete project assets" ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-assets' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- ====================================
-- POLICIES POUR PDFS
-- ====================================

-- Permettre aux utilisateurs de voir les PDFs de leur organisation
CREATE POLICY "Users can view pdfs" ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdfs' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Permettre au service PDF d'uploader des PDFs (via service key)
CREATE POLICY "Service can upload pdfs" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs'
  AND (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);

-- Permettre aux utilisateurs de supprimer les PDFs de leur organisation
CREATE POLICY "Users can delete pdfs" ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdfs' 
  AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- ====================================
-- FONCTIONS HELPER POUR UPLOAD
-- ====================================

-- Fonction pour générer un nom de fichier unique
CREATE OR REPLACE FUNCTION generate_unique_filename(
  original_name TEXT,
  org_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  extension TEXT;
  clean_name TEXT;
  timestamp_str TEXT;
  org_prefix TEXT;
BEGIN
  -- Extraire l'extension
  extension := COALESCE(
    substring(original_name from '\.([^.]+)$'),
    'bin'
  );
  
  -- Nettoyer le nom original (garder seulement alphanumériques et tirets)
  clean_name := regexp_replace(
    split_part(original_name, '.', 1),
    '[^a-zA-Z0-9\-]',
    '-',
    'g'
  );
  
  -- Limiter la longueur
  clean_name := substring(clean_name from 1 for 30);
  
  -- Générer timestamp
  timestamp_str := to_char(now(), 'YYYYMMDD_HH24MISS');
  
  -- Si org_id fourni, utiliser comme préfixe
  IF org_id IS NOT NULL THEN
    org_prefix := org_id::text || '/';
  ELSE
    org_prefix := get_user_organization_id()::text || '/';
  END IF;
  
  -- Retourner le chemin complet
  RETURN org_prefix || timestamp_str || '_' || clean_name || '.' || extension;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- COMMENTAIRES
-- ====================================

COMMENT ON FUNCTION generate_unique_filename IS 'Génère un nom de fichier unique avec organisation/timestamp/nom';

-- Notes sur l'organisation des fichiers :
-- org-logos: {org_id}/filename.ext
-- project-assets: {org_id}/{project_id}/filename.ext  
-- pdfs: {org_id}/{call_sheet_id}/filename.pdf
