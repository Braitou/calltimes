/**
 * CALL TIMES - Organization Invitation Email Service
 * 
 * Service pour envoyer les emails d'invitation organisation via Postmark
 */

import { OrganizationInvitation } from './organization-invitations'

interface SendOrganizationInvitationEmailParams {
  invitation: OrganizationInvitation
  organizationName: string
  inviterName: string
  inviterEmail: string
}

/**
 * Envoyer un email d'invitation organisation via API route Next.js
 */
export async function sendOrganizationInvitationEmail({
  invitation,
  organizationName,
  inviterName,
  inviterEmail
}: SendOrganizationInvitationEmailParams) {
  try {
    // Appeler notre API route Next.js qui enverra l'email côté serveur
    const response = await fetch('/api/invitations/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invitationId: invitation.id
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('API error:', error)
      return { success: false, error: error.error || 'Failed to send invitation email' }
    }

    const result = await response.json()
    console.log('✅ Organization invitation email sent via API route')

    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error sending organization invitation email:', error)
    return { success: false, error: 'Failed to send invitation email' }
  }
}


