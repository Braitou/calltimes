import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * Service pour gérer les Call Sheets avec Supabase
 */

export interface CallSheet {
  id: string
  project_id: string
  organization_id: string
  title: string
  shoot_date: string | null
  call_time: string | null
  status: 'draft' | 'sent' | 'archived'
  notes: string | null
  pdf_url: string | null
  logo_production_url: string | null
  logo_marque_url: string | null
  logo_agence_url: string | null
  editor_data: {
    locations?: Array<{
      id: number
      name: string
      address: string
      notes?: string
    }>
    important_contacts?: Array<{
      id: number
      name: string
      role: string
      phone?: string
      email?: string
    }>
    schedule?: Array<{
      id: number
      title: string
      time: string
    }>
    team?: Array<{
      id: number
      name: string
      role: string
      department: string
      phone?: string
      email?: string
    }>
  }
  created_at: string
  updated_at: string
}

export interface CreateCallSheetInput {
  project_id: string
  title: string
  shoot_date?: string
  call_time?: string
  status?: 'draft' | 'sent' | 'archived'
  notes?: string
  editor_data?: CallSheet['editor_data']
}

/**
 * Récupérer tous les call sheets d'un projet
 */
export async function getCallSheetsByProject(projectId: string): Promise<{ success: boolean; data: CallSheet[]; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('call_sheets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching call sheets:', error)
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
 * Récupérer un call sheet spécifique par son ID
 */
export async function getCallSheetById(callSheetId: string): Promise<{ success: boolean; data?: CallSheet; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('call_sheets')
      .select('*')
      .eq('id', callSheetId)
      .single()

    if (error) {
      console.error('Error fetching call sheet:', error)
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
 * Créer un nouveau call sheet
 */
export async function createCallSheet(input: CreateCallSheetInput): Promise<{ success: boolean; data?: CallSheet; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Récupérer l'organization_id de l'utilisateur
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return { success: false, error: 'No organization found for user' }
    }

    // Créer le call sheet
    const { data, error } = await supabase
      .from('call_sheets')
      .insert({
        project_id: input.project_id,
        organization_id: membership.organization_id,
        title: input.title,
        shoot_date: input.shoot_date || null,
        call_time: input.call_time || null,
        status: input.status || 'draft',
        notes: input.notes || null,
        editor_data: input.editor_data || {}
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating call sheet:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Call sheet created:', data)
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
 * Mettre à jour un call sheet
 */
export async function updateCallSheet(
  callSheetId: string,
  updates: Partial<Omit<CallSheet, 'id' | 'created_at' | 'updated_at' | 'organization_id'>>
): Promise<{ success: boolean; data?: CallSheet; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('call_sheets')
      .update(updates)
      .eq('id', callSheetId)
      .select()
      .single()

    if (error) {
      console.error('Error updating call sheet:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Call sheet updated:', data)
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
 * Supprimer un call sheet
 */
export async function deleteCallSheet(callSheetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('call_sheets')
      .delete()
      .eq('id', callSheetId)

    if (error) {
      console.error('Error deleting call sheet:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Call sheet deleted:', callSheetId)
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
 * Supprimer plusieurs call sheets
 */
export async function deleteCallSheets(callSheetIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    const { error } = await supabase
      .from('call_sheets')
      .delete()
      .in('id', callSheetIds)

    if (error) {
      console.error('Error deleting call sheets:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Call sheets deleted:', callSheetIds.length)
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

