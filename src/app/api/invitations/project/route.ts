/**
 * API Route - Send Project Invitation Email
 * 
 * Cette route envoie les emails d'invitation pour rejoindre un projet spécifique
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route Called: /api/invitations/project')
    
    const body = await request.json()
    const { to, inviterName, projectName, projectDescription, role, invitationToken, invitationUrl } = body
    
    console.log('📧 Sending project invitation:', {
      to,
      projectName,
      role
    })

    if (!to || !inviterName || !projectName || !role || !invitationToken || !invitationUrl) {
      console.error('❌ Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Définir le label du rôle
    const roleLabels = {
      owner: 'Owner',
      editor: 'Editor',
      viewer: 'Viewer (Read-Only)'
    }
    const roleLabel = roleLabels[role as keyof typeof roleLabels] || role

    // Envoyer l'email via Postmark
    console.log('📧 Sending email via Postmark...', {
      from: process.env.POSTMARK_FROM_EMAIL,
      to
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
        To: to,
        Subject: `${inviterName} vous invite au projet "${projectName}" sur Call Times`,
        HtmlBody: generateProjectEmailHTML({
          inviterName,
          projectName,
          projectDescription,
          roleLabel,
          invitationUrl
        }),
        TextBody: generateProjectEmailText({
          inviterName,
          projectName,
          projectDescription,
          roleLabel,
          invitationUrl
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
    console.log('✅ Project invitation email sent:', result.MessageID)

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
 * Générer le HTML de l'email projet
 */
function generateProjectEmailHTML({
  inviterName,
  projectName,
  projectDescription,
  roleLabel,
  invitationUrl
}: {
  inviterName: string
  projectName: string
  projectDescription: string
  roleLabel: string
  invitationUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation au projet ${projectName}</title>
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
                Project Collaboration
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              
              <!-- Invitation Message -->
              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: bold; color: #ffffff;">
                  Invitation au projet 🎬
                </h2>
                <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #d1d1d1;">
                  <strong style="color: #ffffff;">${inviterName}</strong> vous invite à rejoindre le projet
                  <strong style="color: #4ade80;">"${projectName}"</strong> sur Call Times.
                </p>
                ${projectDescription ? `
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a3a3a3; font-style: italic;">
                  "${projectDescription}"
                </p>
                ` : ''}
                <p style="margin: 20px 0 0; font-size: 16px; line-height: 1.6; color: #d1d1d1;">
                  Vous rejoindrez ce projet en tant que <strong style="color: #4ade80;">${roleLabel}</strong>.
                </p>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${invitationUrl}" 
                       style="display: inline-block; padding: 16px 40px; background-color: #4ade80; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Accepter l'invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Role Info -->
              <div style="background-color: #0a0a0a; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px; font-size: 16px; font-weight: bold; color: #ffffff;">
                  Votre rôle : ${roleLabel}
                </h3>
                ${roleLabel === 'Viewer (Read-Only)' ? `
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d1d1;">
                  • Consulter les fichiers et dossiers du projet<br>
                  • Télécharger les documents<br>
                  • Voir les membres de l'équipe<br>
                  • Visualiser les Call Sheets finalisés (PDF)
                </p>
                ` : roleLabel === 'Editor' ? `
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d1d1;">
                  • Toutes les permissions Viewer<br>
                  • Ajouter et modifier des fichiers<br>
                  • Créer et gérer des dossiers<br>
                  • Organiser le contenu du projet
                </p>
                ` : `
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d1d1;">
                  • Accès complet au projet<br>
                  • Gérer tous les fichiers et dossiers<br>
                  • Créer et éditer des Call Sheets<br>
                  • Inviter d'autres membres
                </p>
                `}
              </div>

              <!-- Alternative Link -->
              <p style="margin: 0 0 10px; font-size: 13px; color: #a3a3a3; text-align: center;">
                Ou copiez-collez ce lien dans votre navigateur :
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
                Cette invitation vous a été envoyée par ${inviterName}
              </p>
              <p style="margin: 0; font-size: 12px; color: #666666;">
                Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
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
 * Générer le texte brut de l'email projet
 */
function generateProjectEmailText({
  inviterName,
  projectName,
  projectDescription,
  roleLabel,
  invitationUrl
}: {
  inviterName: string
  projectName: string
  projectDescription: string
  roleLabel: string
  invitationUrl: string
}) {
  return `
CALL TIMES - Invitation au projet

${inviterName} vous invite à rejoindre le projet "${projectName}" sur Call Times.

${projectDescription ? `Description: ${projectDescription}\n` : ''}
Votre rôle : ${roleLabel}

ACCEPTER L'INVITATION :
${invitationUrl}

Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.

---
Call Times - Professional Call Sheet Software
  `.trim()
}

