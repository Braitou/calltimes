import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type ProjectFile = Database['public']['Tables']['project_files']['Row']
export type ProjectFileUpdate = Database['public']['Tables']['project_files']['Update']

/**
 * Met à jour la position d'un fichier (drag & drop)
 */
export async function updateFilePosition(fileId: string, x: number, y: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('project_files')
      .update({ position_x: x, position_y: y })
      .eq('id', fileId)

    if (error) {
      console.error('Error updating file position:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating file position:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Déplace un fichier dans un dossier
 */
export async function moveFileToFolder(fileId: string, folderId: string | null): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('project_files')
      .update({ folder_id: folderId })
      .eq('id', fileId)

    if (error) {
      console.error('Error moving file to folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error moving file to folder:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Récupère les fichiers d'un projet (avec filtrage optionnel par dossier)
 */
export async function getProjectFiles(projectId: string, folderId?: string | null): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    let query = supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    // Filtrer par dossier si spécifié
    if (folderId !== undefined) {
      if (folderId === null) {
        // Fichiers à la racine uniquement
        query = query.is('folder_id', null)
      } else {
        // Fichiers dans un dossier spécifique
        query = query.eq('folder_id', folderId)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching project files:', error)
      return { success: false, data: [], error: error.message }
    }

    // Ajouter l'URL publique pour chaque fichier
    const filesWithUrls = (data || []).map(file => {
      // Générer l'URL publique à partir du file_path
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(file.file_path)
      
      return {
        ...file,
        public_url: publicUrl
      }
    })

    return { success: true, data: filesWithUrls }
  } catch (error) {
    console.error('Error fetching project files:', error)
    return { success: false, data: [], error: 'An unexpected error occurred' }
  }
}

/**
 * Supprime un fichier (de la base de données ET du storage)
 */
export async function deleteFile(fileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    // 1. Récupérer les infos du fichier pour avoir le file_path
    const { data: file, error: fetchError } = await supabase
      .from('project_files')
      .select('file_path')
      .eq('id', fileId)
      .single()

    if (fetchError || !file) {
      console.error('Error fetching file info:', fetchError)
      return { success: false, error: 'Fichier introuvable' }
    }

    // 2. Supprimer du storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([file.file_path])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // On continue quand même pour supprimer de la DB
    }

    // 3. Supprimer de la base de données
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      console.error('Error deleting from database:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

