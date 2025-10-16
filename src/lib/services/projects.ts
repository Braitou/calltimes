import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * Service pour gérer les projets avec Supabase
 */

export interface Project {
  id: string
  organization_id: string
  name: string
  description: string | null
  status: 'active' | 'archived' | 'draft'
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  description?: string
  status?: 'active' | 'archived' | 'draft'
}

/**
 * Récupérer tous les projets de l'organisation de l'utilisateur
 */
export async function getProjects(): Promise<{ success: boolean; data: Project[]; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, data: [], error: 'User not authenticated' }
    }

    // Récupérer l'organization_id de l'utilisateur
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return { success: false, data: [], error: 'No organization found for user' }
    }

    // Récupérer tous les projets de l'organisation
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Récupérer un projet spécifique par son ID
 */
export async function getProjectById(projectId: string): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Créer un nouveau projet
 */
export async function createProject(input: CreateProjectInput): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    // Vérifier l'authentification
    console.log('🔐 [createProject] Vérification authentification...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return { success: false, error: `Auth error: ${authError.message}` }
    }
    
    if (!user) {
      console.error('❌ No user found')
      return { success: false, error: 'User not authenticated' }
    }
    
    console.log('✅ User authenticated:', user.id)

    // Récupérer l'organization_id de l'utilisateur
    console.log('🏢 [createProject] Récupération organization...')
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (membershipError) {
      console.error('❌ Membership error:', membershipError)
      return { success: false, error: `Membership error: ${membershipError.message}` }
    }

    if (!membership) {
      console.error('❌ No membership found for user:', user.id)
      return { success: false, error: 'No organization found for user' }
    }
    
    console.log('✅ Organization found:', membership.organization_id)

    // Créer le projet
    console.log('📝 [createProject] Création du projet...')
    const projectData = {
      organization_id: membership.organization_id,
      name: input.name,
      description: input.description || null,
      status: input.status || 'active'
    }
    console.log('📊 Project data:', projectData)
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating project:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: error.message || 'Failed to create project' }
    }

    console.log('✅ Project created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Mettre à jour un projet
 */
export async function updateProject(
  projectId: string,
  updates: Partial<CreateProjectInput>
): Promise<{ success: boolean; data?: Project; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Supprimer un projet
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      console.error('Error deleting project:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Supprimer plusieurs projets
 */
export async function deleteProjects(projectIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('projects')
      .delete()
      .in('id', projectIds)

    if (error) {
      console.error('Error deleting projects:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

