-- =====================================================
-- ENABLE REALTIME FOR PROJECT HUB TABLES
-- =====================================================
-- Date: 2024-10-18
-- Description: Activer Supabase Realtime pour synchronisation en temps réel
--              entre utilisateurs (Owner, Editors, Viewers)

-- Activer Realtime pour project_files
ALTER PUBLICATION supabase_realtime ADD TABLE project_files;

-- Activer Realtime pour project_folders
ALTER PUBLICATION supabase_realtime ADD TABLE project_folders;

-- Activer Realtime pour call_sheets
ALTER PUBLICATION supabase_realtime ADD TABLE call_sheets;

-- Activer Realtime pour project_members (pour voir les nouveaux invités en temps réel)
ALTER PUBLICATION supabase_realtime ADD TABLE project_members;

-- ✅ Maintenant, tous les changements sur ces tables seront diffusés en temps réel
--    aux clients connectés via Supabase Realtime


