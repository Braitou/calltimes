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

    // Check if user is project owner/editor
    const { data: membership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('email', user.email)
      .single()

    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return { success: false, error: 'Permission denied' }
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
        invited_at: new Date().toISOString(),
        invitation_expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating invitation:', insertError)
      return { success: false, error: insertError.message }
    }

    // Get project details for email
    const { data: project } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', projectId)
      .single()

    // Send invitation email via API route
    try {
      await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          inviterName: user.user_metadata?.full_name || user.email,
          projectName: project?.name || 'Untitled Project',
          projectDescription: project?.description || '',
          role,
          invitationToken,
          invitationUrl: `${window.location.origin}/invite/${invitationToken}`
        })
      })
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

    // Check if current user is owner
    const { data: currentMembership } = await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', member.project_id)
      .eq('email', user.email)
      .single()

    if (!currentMembership || currentMembership.role !== 'owner') {
      return { success: false, error: 'Only owners can remove members' }
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

