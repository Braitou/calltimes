-- ====================================
-- CRÉATION DU BUCKET project-files
-- ====================================
-- Bucket pour stocker tous les fichiers uploadés dans les projets

-- Créer le bucket (public pour faciliter l'accès)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'project-files', 
    'project-files', 
    true, -- PUBLIC pour permettre l'accès direct aux URLs
    104857600, -- 100MB limit par fichier
    NULL -- Tous les types de fichiers acceptés
  )
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = NULL;

-- ====================================
-- POLICIES POUR project-files
-- ====================================

-- Permettre à tous de voir les fichiers (bucket public)
CREATE POLICY "Anyone can view project files" ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Permettre aux utilisateurs authentifiés d'uploader des fichiers
CREATE POLICY "Authenticated users can upload project files" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- Permettre aux utilisateurs de modifier leurs propres fichiers
CREATE POLICY "Users can update their own project files" ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' 
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.uid() = owner
);

-- Permettre aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own project files" ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' 
  AND auth.uid() = owner
);

-- ====================================
-- NOTES
-- ====================================
-- Le bucket est configuré en mode PUBLIC pour simplifier l'accès aux fichiers
-- Les URLs générées avec getPublicUrl() fonctionneront directement
-- La sécurité est assurée par les policies RLS sur la table project_files

