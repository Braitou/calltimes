/**
 * API Route - Send Organization Invitation Email
 * 
 * Cette route est appelée côté serveur pour envoyer les emails d'invitation
 * via Postmark sans exposer l'API key au client
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Créer un client Supabase côté serveur avec la service key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route Called: /api/invitations/send')
    
    // Vérifier les variables d'environnement
    console.log('📋 ENV Check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasPostmarkKey: !!process.env.POSTMARK_API_KEY,
      postmarkFrom: process.env.POSTMARK_FROM_EMAIL
    })
    
    const body = await request.json()
    const { invitationId } = body
    
    console.log('📧 Invitation ID:', invitationId)

    if (!invitationId) {
      console.error('❌ No invitation ID provided')
      return NextResponse.json(
        { success: false, error: 'Invitation ID required' },
        { status: 400 }
      )
    }

    // 1. Récupérer l'invitation avec les détails
    console.log('🔍 Fetching invitation from Supabase...')
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('organization_invitations')
      .select(`
        *,
        organization:organizations(id, name),
        inviter:users!organization_invitations_invited_by_fkey(id, full_name, email)
      `)
      .eq('id', invitationId)
      .single()

    if (invitationError) {
      console.error('❌ Supabase error:', invitationError)
      return NextResponse.json(
        { success: false, error: 'Database error', details: invitationError },
        { status: 500 }
      )
    }

    if (!invitation) {
      console.error('❌ Invitation not found:', invitationId)
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Invitation found:', {
      id: invitation.id,
      email: invitation.email,
      org: invitation.organization?.name
    })

    // 2. Préparer les données pour l'email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/org/${invitation.invitation_token}`
    
    const expiresAt = new Date(invitation.expires_at)
    const expiresFormatted = expiresAt.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const roleLabel = invitation.role === 'owner' ? 'Owner (Admin)' : 'Member'
    const organizationName = invitation.organization?.name || 'Unknown Organization'
    const inviterName = invitation.inviter?.full_name || invitation.inviter?.email || 'Unknown'

    // 3. Envoyer l'email via Postmark
    console.log('📧 Sending email via Postmark...', {
      from: process.env.POSTMARK_FROM_EMAIL,
      to: invitation.email
    })
    
    const postmarkResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': process.env.POSTMARK_API_KEY || ''
      },
      body: JSON.stringify({
        From: process.env.POSTMARK_FROM_EMAIL || 'noreply@call-times.app',
        To: invitation.email,
        Subject: `${organizationName} vous invite à rejoindre Call Times`,
        HtmlBody: generateEmailHTML({
          organizationName,
          inviterName,
          roleLabel,
          invitationUrl,
          expiresFormatted
        }),
        TextBody: generateEmailText({
          organizationName,
          inviterName,
          roleLabel,
          invitationUrl,
          expiresFormatted
        }),
        MessageStream: 'outbound'
      })
    })

    if (!postmarkResponse.ok) {
      const error = await postmarkResponse.json()
      console.error('❌ Postmark error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    const result = await postmarkResponse.json()
    console.log('✅ Organization invitation email sent:', result.MessageID)

    return NextResponse.json({
      success: true,
      data: { messageId: result.MessageID }
    })
  } catch (error) {
    console.error('❌ Fatal error in API route:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * Générer le HTML de l'email
 */
function generateEmailHTML({
  organizationName,
  inviterName,
  roleLabel,
  invitationUrl,
  expiresFormatted
}: {
  organizationName: string
  inviterName: string
  roleLabel: string
  invitationUrl: string
  expiresFormatted: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à rejoindre ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border: 1px solid #333333; border-radius: 12px;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 10px; font-size: 28px; font-weight: bold; color: #ffffff;">
                Call Times
              </h1>
              <p style="margin: 0; font-size: 14px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.5px;">
                Professional Call Sheet Software
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              
              <!-- Invitation Message -->
              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: bold; color: #ffffff;">
                  You're Invited! 🎬
                </h2>
                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #d1d1d1;">
                  <strong style="color: #ffffff;">${inviterName}</strong> has invited you to join 
                  <strong style="color: #4ade80;">${organizationName}</strong> on Call Times.
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #d1d1d1;">
                  You'll be joining as a <strong style="color: #4ade80;">${roleLabel}</strong>, giving you access to 
                  all projects, contacts, and call sheets.
                </p>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${invitationUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #4ade80; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <div style="background-color: #0a0a0a; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #a3a3a3;">Organization:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #ffffff; font-weight: 600; text-align: right;">
                      ${organizationName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #a3a3a3;">Invited by:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #ffffff; font-weight: 600; text-align: right;">
                      ${inviterName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #a3a3a3;">Your role:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #4ade80; font-weight: 600; text-align: right;">
                      ${roleLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 14px; color: #a3a3a3;">Expires:</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #ffffff; text-align: right;">
                      ${expiresFormatted}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Alternative Link -->
              <p style="margin: 0 0 10px; font-size: 13px; color: #a3a3a3; text-align: center;">
                Or copy and paste this link in your browser:
              </p>
              <p style="margin: 0; font-size: 13px; color: #4ade80; text-align: center; word-break: break-all;">
                ${invitationUrl}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #333333; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666666;">
                This invitation was sent by ${inviterName} (${organizationName})
              </p>
              <p style="margin: 0; font-size: 12px; color: #666666;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Générer le texte brut de l'email (fallback)
 */
function generateEmailText({
  organizationName,
  inviterName,
  roleLabel,
  invitationUrl,
  expiresFormatted
}: {
  organizationName: string
  inviterName: string
  roleLabel: string
  invitationUrl: string
  expiresFormatted: string
}) {
  return `
CALL TIMES - Invitation to Join Organization

You're Invited!

${inviterName} has invited you to join ${organizationName} on Call Times.

You'll be joining as a ${roleLabel}, giving you access to all projects, contacts, and call sheets.

ACCEPT INVITATION:
${invitationUrl}

DETAILS:
- Organization: ${organizationName}
- Invited by: ${inviterName}
- Your role: ${roleLabel}
- Expires: ${expiresFormatted}

If you didn't expect this invitation, you can safely ignore this email.

---
Call Times - Professional Call Sheet Software
  `.trim()
}
