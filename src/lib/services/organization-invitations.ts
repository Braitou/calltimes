/**
 * CALL TIMES - Organization Invitations Service
 * 
 * Gestion des invitations pour rejoindre une organisation
 * Victor peut inviter Simon à devenir membre de son organisation
 */

import { supabase } from '@/lib/supabase/client'
import { sendOrganizationInvitationEmail } from './email-organization-invitation'

export interface OrganizationInvitation {
  id: string
  organization_id: string
  email: string
  role: 'owner' | 'member'
  invitation_token: string
  invited_by: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at: string
  expires_at: string
  accepted_at?: string
}

export interface OrganizationInvitationWithDetails extends OrganizationInvitation {
  organization?: {
    id: string
    name: string
  }
  inviter?: {
    id: string
    full_name: string
    email: string
  }
}

/**
 * Créer une nouvelle invitation organisation
 */
export async function createOrganizationInvitation(
  organizationId: string,
  email: string,
  role: 'owner' | 'member' = 'member'
) {
  try {
    // 1. Vérifier que l'utilisateur est owner de l'org
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (membershipError || !membership || membership.role !== 'owner') {
      return { success: false, error: 'Only organization owners can invite members' }
    }

    // 2. Vérifier que l'email n'est pas déjà membre
    const { data: existingMember } = await supabase
      .from('memberships')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .single()

    if (existingMember) {
      return { success: false, error: 'This email is already a member of the organization' }
    }

    // 3. Vérifier qu'il n'y a pas déjà une invitation pending
    const { data: existingInvitation } = await supabase
      .from('organization_invitations')
      .select('id, status')
      .eq('organization_id', organizationId)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return { success: false, error: 'An invitation for this email is already pending' }
    }

    // 4. Créer l'invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Error creating invitation:', invitationError)
      return { success: false, error: invitationError.message }
    }

    // 5. Récupérer les infos de l'organisation et de l'inviter pour l'email
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    const { data: inviter } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // 6. Envoyer l'email d'invitation
    if (org && inviter) {
      const emailResult = await sendOrganizationInvitationEmail({
        invitation,
        organizationName: org.name,
        inviterName: inviter.full_name || inviter.email,
        inviterEmail: inviter.email
      })

      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error)
        // On continue quand même, l'invitation est créée
      }
    }

    return { success: true, data: invitation }
  } catch (error) {
    console.error('Error creating organization invitation:', error)
    return { success: false, error: 'Failed to create invitation' }
  }
}

/**
 * Récupérer une invitation par token
 */
export async function getOrganizationInvitation(token: string) {
  try {
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organization:organizations(id, name),
        inviter:users!organization_invitations_invited_by_fkey(id, full_name, email)
      `)
      .eq('invitation_token', token)
      .single()

    if (error) {
      console.error('Error fetching invitation:', error)
      return { success: false, error: 'Invitation not found' }
    }

    // Vérifier que l'invitation est toujours valide
    if (invitation.status !== 'pending') {
      return { success: false, error: `This invitation has already been ${invitation.status}` }
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'This invitation has expired' }
    }

    return { success: true, data: invitation as OrganizationInvitationWithDetails }
  } catch (error) {
    console.error('Error getting organization invitation:', error)
    return { success: false, error: 'Failed to retrieve invitation' }
  }
}

/**
 * Accepter une invitation (utilisateur existant)
 */
export async function acceptOrganizationInvitation(token: string) {
  try {
    // 1. Récupérer l'invitation
    const invitationResult = await getOrganizationInvitation(token)
    if (!invitationResult.success || !invitationResult.data) {
      return invitationResult
    }

    const invitation = invitationResult.data

    // 2. Vérifier que l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'You must be logged in to accept an invitation' }
    }

    // 3. Vérifier que l'email correspond (si l'utilisateur a un email)
    if (user.email && user.email !== invitation.email) {
      return { 
        success: false, 
        error: `This invitation is for ${invitation.email}, but you are logged in as ${user.email}` 
      }
    }

    // 4. Créer le membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: user.id,
        organization_id: invitation.organization_id,
        role: invitation.role,
        email: invitation.email
      })
      .select()
      .single()

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      return { success: false, error: 'Failed to join organization' }
    }

    // 5. Marquer l'invitation comme acceptée
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation status:', updateError)
      // Le membership est créé, donc on continue quand même
    }

    return { success: true, data: { membership, invitation } }
  } catch (error) {
    console.error('Error accepting organization invitation:', error)
    return { success: false, error: 'Failed to accept invitation' }
  }
}

/**
 * Accepter une invitation avec création de compte
 */
export async function acceptOrganizationInvitationWithSignup(
  token: string,
  fullName: string,
  password: string
) {
  try {
    // 1. Récupérer l'invitation (sans auth)
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return { success: false, error: 'Invitation not found or expired' }
    }

    // Vérifier expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return { success: false, error: 'This invitation has expired' }
    }

    // 2. Créer le compte utilisateur
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (signupError || !authData.user) {
      console.error('Error creating account:', signupError)
      return { success: false, error: signupError?.message || 'Failed to create account' }
    }

    const newUser = authData.user

    // 3. Créer le user dans notre table users
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: newUser.id,
        email: invitation.email,
        full_name: fullName
      })

    if (userError) {
      console.error('Error creating user record:', userError)
      // Continue quand même, l'auth est créée
    }

    // 4. Créer le membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: newUser.id,
        organization_id: invitation.organization_id,
        role: invitation.role,
        email: invitation.email
      })
      .select()
      .single()

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      return { success: false, error: 'Account created but failed to join organization' }
    }

    // 5. Marquer l'invitation comme acceptée
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation status:', updateError)
    }

    return { 
      success: true, 
      data: { 
        user: newUser, 
        membership, 
        invitation 
      } 
    }
  } catch (error) {
    console.error('Error accepting invitation with signup:', error)
    return { success: false, error: 'Failed to create account and join organization' }
  }
}

/**
 * Lister toutes les invitations d'une organisation
 */
export async function listOrganizationInvitations(organizationId: string) {
  try {
    const { data: invitations, error } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        inviter:users!organization_invitations_invited_by_fkey(id, full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error listing invitations:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: invitations }
  } catch (error) {
    console.error('Error listing organization invitations:', error)
    return { success: false, error: 'Failed to list invitations' }
  }
}

/**
 * Révoquer une invitation
 */
export async function revokeOrganizationInvitation(invitationId: string) {
  try {
    const { data, error } = await supabase
      .from('organization_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId)
      .select()
      .single()

    if (error) {
      console.error('Error revoking invitation:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error revoking organization invitation:', error)
    return { success: false, error: 'Failed to revoke invitation' }
  }
}

/**
 * Lister les membres d'une organisation (avec invitations pending)
 * Si organizationId n'est pas fourni, récupère l'organisation de l'utilisateur connecté
 */
export async function listOrganizationMembers(organizationId?: string) {
  try {
    let orgId = organizationId

    // Si pas d'organizationId fourni, récupérer celui de l'utilisateur
    if (!orgId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { success: false, error: 'User not authenticated' }
      }

      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        console.error('Error getting user organization:', membershipError)
        return { success: false, error: 'No organization found for user' }
      }

      orgId = membership.organization_id
    }

    // Membres existants
    const { data: memberships, error: membersError } = await supabase
      .from('memberships')
      .select(`
        id,
        role,
        created_at,
        user_id,
        users!inner(id, full_name, email)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: true })

    if (membersError) {
      console.error('Error listing members:', membersError)
      return { success: false, error: membersError.message }
    }

    // Transformer les données pour avoir un format simple
    const members = memberships?.map(m => ({
      id: m.user_id,
      full_name: (m.users as any)?.full_name || null,
      email: (m.users as any)?.email || '',
      role: m.role
    })) || []

    // Invitations pending
    const { data: invitations, error: invitationsError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (invitationsError) {
      console.error('Error listing invitations:', invitationsError)
      // Continue quand même avec les membres
    }

    return { 
      success: true, 
      data: {
        members: members || [],
        pending_invitations: invitations || []
      }
    }
  } catch (error) {
    console.error('Error listing organization members:', error)
    return { success: false, error: 'Failed to list members' }
  }
}

