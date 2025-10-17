import { createSupabaseClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

export type MemberRole = 'owner' | 'editor' | 'viewer'

/**
 * Invite a member to a project
 */
export async function inviteProjectMember(
  projectId: string,
  email: string,
  role: MemberRole
): Promise<{ success: boolean; error?: string; invitationId?: string }> {
  try {
    const supabase = createSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if user is organization member (has permission to invite)
    // Get project organization
    const { data: project } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()
    
    if (!project) {
      return { success: false, error: 'Project not found' }
    }
    
    // Check if user is member of the project's organization
    const { data: orgMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', project.organization_id)
      .eq('user_id', user.id)
      .single()
    
    // Alternatively, check if user is project owner
    const { data: projectMembership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()
    
    const isOrgMember = !!orgMembership
    const isProjectOwner = projectMembership?.role === 'owner'
    
    if (!isOrgMember && !isProjectOwner) {
      return { success: false, error: 'Permission denied - not an organization member or project owner' }
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('email', email)
      .single()

    if (existing) {
      return { success: false, error: 'User already invited or is a member' }
    }

    // Generate invitation token
    const invitationToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    // Insert invitation
    const { data: invitation, error: insertError } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        email: email.toLowerCase(),
        role,
        invitation_token: invitationToken,
        invitation_status: 'pending',
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating invitation:', insertError)
      return { success: false, error: insertError.message }
    }

    // Get project details for email
    const { data: projectDetails } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', projectId)
      .single()

    // Send invitation email via API route
    try {
      const emailResponse = await fetch('/api/invitations/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          inviterName: user.user_metadata?.full_name || user.email,
          projectName: projectDetails?.name || 'Untitled Project',
          projectDescription: projectDetails?.description || '',
          role,
          invitationToken,
          invitationUrl: `${window.location.origin}/invite/${invitationToken}`
        })
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        console.error('Error sending email:', errorData)
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the invitation if email fails
    }

    return { success: true, invitationId: invitation.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Validate guest invitation token (without authentication)
 * Used for anonymous guest access
 */
export async function validateGuestInvitation(token: string): Promise<{
  success: boolean
  projectId?: string
  projectName?: string
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    console.log('🔍 Validating guest token:', token)

    // Find invitation by token
    const { data: invitation, error: fetchError } = await supabase
      .from('project_members')
      .select(`
        id,
        project_id,
        email,
        role,
        invitation_status,
        expires_at,
        project:projects(id, name)
      `)
      .eq('invitation_token', token)
      .eq('invitation_status', 'pending')
      .single()

    console.log('📧 Invitation result:', { invitation, error: fetchError })

    if (fetchError || !invitation) {
      console.error('❌ Invitation fetch error:', fetchError)
      return { success: false, error: 'Invitation non trouvée ou expirée' }
    }

    // Check expiration
    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      return { success: false, error: 'Cette invitation a expiré' }
    }

    // Return project info (no need to update status for guests)
    return {
      success: true,
      projectId: invitation.project_id,
      projectName: (invitation.project as any)?.name || 'Projet'
    }
  } catch (error) {
    console.error('Error validating guest invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de validation'
    }
  }
}

/**
 * Get pending invitations for a project
 */
export async function getPendingInvitations(projectId: string): Promise<{
  success: boolean
  data: Array<{
    id: string
    email: string
    role: 'owner' | 'editor' | 'viewer'
    invited_at: string
  }>
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('project_members')
      .select('id, email, role, invited_at')
      .eq('project_id', projectId)
      .eq('invitation_status', 'pending')
      .order('invited_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending invitations:', error)
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
 * Revoke a pending invitation
 */
export async function revokeInvitation(invitationId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    // Delete the invitation
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', invitationId)
      .eq('invitation_status', 'pending') // Safety check

    if (error) {
      console.error('Error revoking invitation:', error)
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
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<{
  success: boolean
  error?: string
  projectId?: string
}> {
  try {
    const supabase = createSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Find invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('project_members')
      .select('*')
      .eq('invitation_token', token)
      .eq('invitation_status', 'pending')
      .single()

    if (fetchError || !invitation) {
      return { success: false, error: 'Invalid or expired invitation' }
    }

    // Check expiration
    if (invitation.invitation_expires_at && new Date(invitation.invitation_expires_at) < new Date()) {
      return { success: false, error: 'Invitation has expired' }
    }

    // Update invitation
    const { error: updateError } = await supabase
      .from('project_members')
      .update({
        user_id: user.id,
        invitation_status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error accepting invitation:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, projectId: invitation.project_id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string) {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching members:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(memberId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get member to remove
    const { data: member } = await supabase
      .from('project_members')
      .select('project_id, role')
      .eq('id', memberId)
      .single()

    if (!member) {
      return { success: false, error: 'Member not found' }
    }

    // Check if current user has permission (org member OR project owner)
    // 1. Check if user is org member
    const { data: project } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', member.project_id)
      .single()

    let hasPermission = false

    if (project) {
      const { data: orgMembership } = await supabase
        .from('memberships')
        .select('id')
        .eq('organization_id', project.organization_id)
        .eq('user_id', user.id)
        .single()

      if (orgMembership) {
        hasPermission = true
      }
    }

    // 2. If not org member, check if project owner
    if (!hasPermission) {
      const { data: projectMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', member.project_id)
        .eq('user_id', user.id)
        .single()

      if (projectMembership && projectMembership.role === 'owner') {
        hasPermission = true
      }
    }

    if (!hasPermission) {
      return { success: false, error: 'Only organization members or project owners can remove members' }
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      return { success: false, error: 'Cannot remove project owner' }
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing member:', deleteError)
      return { success: false, error: deleteError.message }
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

