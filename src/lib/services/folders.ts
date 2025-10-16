import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export type ProjectFolder = Database['public']['Tables']['project_folders']['Row']
export type ProjectFolderInsert = Database['public']['Tables']['project_folders']['Insert']
export type ProjectFolderUpdate = Database['public']['Tables']['project_folders']['Update']

/**
 * Crée un nouveau dossier dans un projet
 */
export async function createFolder(input: Omit<ProjectFolderInsert, 'organization_id'>): Promise<{ success: boolean; data?: ProjectFolder; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return { success: false, error: 'No organization found for user' }
    }

    const { data, error } = await supabase
      .from('project_folders')
      .insert({
        ...input,
        organization_id: membership.organization_id,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error creating folder:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Récupère tous les dossiers d'un projet
 */
export async function getFoldersByProject(projectId: string): Promise<{ success: boolean; data: ProjectFolder[]; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('project_folders')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching folders:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching folders:', error)
    return { success: false, data: [], error: 'An unexpected error occurred' }
  }
}

/**
 * Met à jour un dossier (nom, position, couleur)
 */
export async function updateFolder(folderId: string, updates: ProjectFolderUpdate): Promise<{ success: boolean; data?: ProjectFolder; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('project_folders')
      .update(updates)
      .eq('id', folderId)
      .select()
      .single()

    if (error) {
      console.error('Error updating folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error updating folder:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Supprime un dossier (les fichiers dedans sont remis à la racine)
 */
export async function deleteFolder(folderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('project_folders')
      .delete()
      .eq('id', folderId)

    if (error) {
      console.error('Error deleting folder:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting folder:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Met à jour la position d'un dossier (drag & drop)
 */
export async function updateFolderPosition(folderId: string, x: number, y: number): Promise<{ success: boolean; error?: string }> {
  return updateFolder(folderId, { position_x: x, position_y: y })
}

