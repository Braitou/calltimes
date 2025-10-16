import { NextRequest, NextResponse } from 'next/server'
import { ServerClient } from 'postmark'

const postmarkClient = new ServerClient(process.env.POSTMARK_API_TOKEN!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      to,
      inviterName,
      projectName,
      projectDescription,
      role,
      invitationUrl
    } = body

    // Validate required fields
    if (!to || !inviterName || !projectName || !invitationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email via Postmark
    const result = await postmarkClient.sendEmail({
      From: 'noreply@call-times.app',
      To: to,
      Subject: `You've been invited to ${projectName} on Call Times`,
      HtmlBody: generateInvitationEmailHTML({
        inviterName,
        projectName,
        projectDescription,
        role,
        invitationUrl
      }),
      TextBody: generateInvitationEmailText({
        inviterName,
        projectName,
        projectDescription,
        role,
        invitationUrl
      }),
      MessageStream: 'outbound'
    })

    return NextResponse.json({ success: true, messageId: result.MessageID })
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation email' },
      { status: 500 }
    )
  }
}

function generateInvitationEmailHTML({
  inviterName,
  projectName,
  projectDescription,
  role,
  invitationUrl
}: {
  inviterName: string
  projectName: string
  projectDescription: string
  role: string
  invitationUrl: string
}) {
  const roleDescriptions = {
    owner: 'full access to manage everything',
    editor: 'upload, edit, and delete files',
    viewer: 'view and download files'
  }

  const roleDescription = roleDescriptions[role as keyof typeof roleDescriptions] || 'collaborate on'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border: 1px solid #333333; border-radius: 12px;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #4ade80;">Call Times</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #ffffff;">
                You've been invited to collaborate
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #a3a3a3;">
                <strong style="color: #ffffff;">${inviterName}</strong> has invited you to join the project:
              </p>

              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #ffffff;">
                  ${projectName}
                </h3>
                ${projectDescription ? `
                  <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #a3a3a3;">
                    ${projectDescription}
                  </p>
                ` : ''}
              </div>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #a3a3a3;">
                As a <strong style="color: #4ade80; text-transform: capitalize;">${role}</strong>, you'll be able to ${roleDescription}.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${invitationUrl}" style="display: inline-block; background-color: #4ade80; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #666666; text-align: center;">
                This invitation will expire in 7 days.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid #222222;">
              <p style="margin: 0; font-size: 12px; color: #666666;">
                Sent by Call Times • Professional Call Sheet Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function generateInvitationEmailText({
  inviterName,
  projectName,
  projectDescription,
  role,
  invitationUrl
}: {
  inviterName: string
  projectName: string
  projectDescription: string
  role: string
  invitationUrl: string
}) {
  return `
You've been invited to collaborate on Call Times

${inviterName} has invited you to join the project: ${projectName}

${projectDescription ? `Description: ${projectDescription}\n` : ''}
Your role: ${role}

Accept this invitation by visiting:
${invitationUrl}

This invitation will expire in 7 days.

---
Sent by Call Times • Professional Call Sheet Management
  `.trim()
}




