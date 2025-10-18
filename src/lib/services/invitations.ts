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
/**
 * Accept project invitation for authenticated users
 * Updates user_id and changes status to 'accepted'
 */
export async function acceptProjectInvitation(token: string): Promise<{
  success: boolean
  projectId?: string
  projectName?: string
  role?: MemberRole
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    console.log('🔍 Accepting invitation with token:', token)

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    console.log('👤 User authenticated:', user.email)

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

    console.log('📧 Invitation found:', { invitation, error: fetchError })

    if (fetchError || !invitation) {
      console.error('❌ Invitation fetch error:', fetchError)
      return { success: false, error: 'Invitation non trouvée ou expirée' }
    }

    // Check expiration
    const expiresAt = new Date(invitation.expires_at)
    if (expiresAt < new Date()) {
      return { success: false, error: 'Cette invitation a expiré' }
    }

    // Verify email matches (optional, but recommended)
    if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
      console.warn('⚠️ Email mismatch:', { invitationEmail: invitation.email, userEmail: user.email })
      // Continue anyway - allow user to accept invitation even if email doesn't match
    }

    // Update invitation: add user_id and change status to 'accepted'
    const { error: updateError } = await supabase
      .from('project_members')
      .update({
        user_id: user.id,
        invitation_status: 'accepted',
        invitation_token: null // Clear token after acceptance
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('❌ Error updating invitation:', updateError)
      return { success: false, error: 'Erreur lors de l\'acceptation de l\'invitation' }
    }

    console.log('✅ Invitation accepted successfully')

    return {
      success: true,
      projectId: invitation.project_id,
      projectName: (invitation.project as any)?.name || 'Projet',
      role: invitation.role as MemberRole
    }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur d\'acceptation'
    }
  }
}

/**
 * Validate guest invitation (for anonymous access)
 * Does NOT update user_id - just validates token for localStorage storage
 * Returns role for permission management
 */
export async function validateGuestInvitation(token: string): Promise<{
  success: boolean
  projectId?: string
  projectName?: string
  role?: string
  email?: string
  invitationId?: string
  invitationStatus?: string
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    console.log('🔍 Validating guest token:', token)

    // Find invitation by token
    // Accept both 'pending' and 'accepted' status (for returning guests)
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
      .in('invitation_status', ['pending', 'accepted'])
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

    // Return project info + role (no need to update status for guests)
    return {
      success: true,
      projectId: invitation.project_id,
      projectName: (invitation.project as any)?.name || 'Projet',
      role: invitation.role, // NEW: Return role for anonymous access
      email: invitation.email,
      invitationId: invitation.id,
      invitationStatus: invitation.invitation_status // NEW: Return status to check if already accepted
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
 * Create or login to a temporary service account for guest editors
 * This allows guests to upload files and have proper auth.uid() for RLS
 * Also creates a membership entry to link the service account to the organization
 */
export async function createGuestServiceAccount(
  token: string, 
  email: string, 
  projectId: string,
  invitationId: string,
  guestName?: string
): Promise<{
  success: boolean
  userId?: string
  error?: string
}> {
  try {
    const supabase = createSupabaseClient()

    // Generate a deterministic password from the token (secure enough for temp accounts)
    // Use only the token so it's the same every time
    const password = `guest-service-${token}`
    const guestEmail = `guest-${token}@call-times.internal`

    console.log('🔐 Creating/logging in guest service account for:', email, 'with name:', guestName)

    let userId: string | undefined

    // Try to sign up (will fail if account already exists)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: guestEmail,
      password,
      options: {
        data: {
          full_name: guestName || `Guest (${email})`,
          is_guest: true,
          guest_email: email,
          guest_display_name: guestName
        }
      }
    })

    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error('❌ Error creating guest account:', signUpError)
      return { success: false, error: signUpError.message }
    }

    // If signup succeeded, we're logged in
    if (signUpData.user) {
      console.log('✅ Guest service account created and logged in:', signUpData.user.id)
      userId = signUpData.user.id
    } else {
      // If account already exists, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password
      })

      if (signInError) {
        console.error('❌ Error signing in guest account:', signInError)
        return { success: false, error: signInError.message }
      }

      console.log('✅ Guest service account logged in:', signInData.user?.id)
      userId = signInData.user?.id
    }

    if (!userId) {
      return { success: false, error: 'Failed to get user ID' }
    }

    // 🔑 IMPORTANT: Get the project's organization_id
    const { data: project } = await supabase
      .from('projects')
      .select('organization_id')
      .eq('id', projectId)
      .single()

    if (!project) {
      console.error('❌ Project not found:', projectId)
      return { success: false, error: 'Project not found' }
    }

    console.log('📋 Project organization:', project.organization_id)

    // 🔑 IMPORTANT: Do NOT add guest service accounts to memberships table
    // Guest editors/viewers should ONLY be in project_members, not in memberships
    // This ensures they are treated as external guests with limited permissions
    console.log('✅ Guest service account will remain external (not in memberships)')

    // Update the invitation with user_id and change status to 'accepted'
    // Keep the token for future validations (when guest returns to the project)
    const { error: updateError } = await supabase
      .from('project_members')
      .update({
        user_id: userId,
        invitation_status: 'accepted'
        // DON'T clear invitation_token - we need it for future validations
      })
      .eq('id', invitationId)

    if (updateError) {
      console.error('❌ Error updating invitation:', updateError)
      // Continue anyway
    } else {
      console.log('✅ Invitation marked as accepted')
    }

    return { success: true, userId }
  } catch (error) {
    console.error('Error with guest service account:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur de création de compte'
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

