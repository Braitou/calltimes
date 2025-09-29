import { Client as PostmarkClient } from 'postmark'

// Configuration Postmark
const POSTMARK_API_TOKEN = process.env.POSTMARK_API_TOKEN || ''
const POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'noreply@calltimes.app'

// Client Postmark (lazy initialization pour éviter l'erreur côté client)
let postmarkClient: PostmarkClient | null = null

function getPostmarkClient(): PostmarkClient {
  if (!postmarkClient && typeof window === 'undefined') {
    // Seulement côté serveur
    postmarkClient = new PostmarkClient(POSTMARK_API_TOKEN)
  }
  return postmarkClient!
}

// Types pour l'envoi d'emails
export interface EmailRecipient {
  email: string
  name: string
  role?: string
}

export interface CallSheetEmailData {
  callSheetId: string
  callSheetTitle: string
  projectName: string
  shootDate: string
  pdfUrl: string
  recipients: EmailRecipient[]
  customMessage?: string
  customSubject?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  status?: string
  recipients: {
    email: string
    status: 'sent' | 'failed'
    error?: string
  }[]
}

/**
 * Génère le sujet par défaut de l'email
 */
function generateDefaultSubject(callSheetTitle: string, shootDate: string): string {
  const formattedDate = new Date(shootDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `📋 Call Sheet - ${callSheetTitle} - ${formattedDate}`
}

/**
 * Génère le contenu HTML de l'email
 */
function generateEmailHTML(data: CallSheetEmailData): string {
  const { callSheetTitle, projectName, shootDate, customMessage } = data
  
  const formattedDate = new Date(shootDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Call Sheet - ${callSheetTitle}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4ade80;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      color: #000;
      margin: 0;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 8px 0 0 0;
    }
    .content {
      margin-bottom: 30px;
    }
    .date-info {
      background: #f0fdf4;
      border: 1px solid #4ade80;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .date-info strong {
      color: #15803d;
      font-size: 18px;
    }
    .message {
      background: #f8fafc;
      border-left: 4px solid #4ade80;
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: #4ade80;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">📋 Call Sheet</h1>
      <p class="subtitle">${callSheetTitle}</p>
    </div>
    
    <div class="content">
      <p>Bonjour,</p>
      
      <p>Veuillez trouver ci-joint la call sheet pour le tournage <strong>${projectName}</strong>.</p>
      
      <div class="date-info">
        <strong>📅 Date de tournage : ${formattedDate}</strong>
      </div>
      
      ${customMessage ? `
      <div class="message">
        <h3 style="margin-top: 0; color: #374151;">Message de l'équipe :</h3>
        <p style="margin-bottom: 0;">${customMessage.replace(/\n/g, '<br>')}</p>
      </div>
      ` : ''}
      
      <p><strong>Merci de consulter attentivement le document en pièce jointe</strong> qui contient toutes les informations nécessaires :</p>
      
      <ul>
        <li>📍 Lieux de tournage et adresses</li>
        <li>⏰ Planning détaillé de la journée</li>
        <li>👥 Contacts équipe et intervenants</li>
        <li>📝 Notes importantes</li>
      </ul>
      
      <p>En cas de question, n'hésitez pas à contacter l'équipe de production.</p>
      
      <p>Excellente journée de tournage ! 🎬</p>
    </div>
    
    <div class="footer">
      <p>Email envoyé via <strong>Call Times</strong> - Gestion professionnelle de call sheets</p>
    </div>
  </div>
</body>
</html>
  `
}

/**
 * Génère le contenu texte de l'email (fallback)
 */
function generateEmailText(data: CallSheetEmailData): string {
  const { callSheetTitle, projectName, shootDate, customMessage } = data
  
  const formattedDate = new Date(shootDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
CALL SHEET - ${callSheetTitle}

Bonjour,

Veuillez trouver ci-joint la call sheet pour le tournage ${projectName}.

Date de tournage : ${formattedDate}

${customMessage ? `
Message de l'équipe :
${customMessage}

` : ''}

Merci de consulter attentivement le document en pièce jointe qui contient toutes les informations nécessaires :

- Lieux de tournage et adresses
- Planning détaillé de la journée  
- Contacts équipe et intervenants
- Notes importantes

En cas de question, n'hésitez pas à contacter l'équipe de production.

Excellente journée de tournage !

---
Email envoyé via Call Times - Gestion professionnelle de call sheets
  `.trim()
}

/**
 * Mode développement : Simulation d'envoi d'email
 */
async function sendEmailDemo(data: CallSheetEmailData): Promise<EmailSendResult> {
  console.log('📧 [DEMO] Simulation envoi email:', {
    to: data.recipients.map(r => r.email),
    subject: data.customSubject || generateDefaultSubject(data.callSheetTitle, data.shootDate),
    pdfUrl: data.pdfUrl
  })

  // Simulation d'un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    success: true,
    messageId: `demo-${Date.now()}`,
    status: 'sent',
    recipients: data.recipients.map(recipient => ({
      email: recipient.email,
      status: 'sent' as const
    }))
  }
}

/**
 * Envoie la call sheet par email avec PDF en pièce jointe
 */
export async function sendCallSheetEmail(data: CallSheetEmailData): Promise<EmailSendResult> {
  try {
    // Mode développement : simulation
    if (!POSTMARK_API_TOKEN || POSTMARK_API_TOKEN === '') {
      console.warn('⚠️ Postmark non configuré - mode démo activé')
      return await sendEmailDemo(data)
    }

    const subject = data.customSubject || generateDefaultSubject(data.callSheetTitle, data.shootDate)
    const htmlBody = generateEmailHTML(data)
    const textBody = generateEmailText(data)

    // Gérer le PDF pour l'attachement
    let pdfAttachment: { Name: string; Content: string; ContentType: string } | undefined

    try {
      // Si l'URL est une blob (mode démo), utiliser le service PDF pour régénérer
      if (data.pdfUrl.startsWith('blob:')) {
        console.log('🔄 URL blob détectée, régénération via service PDF...')
        
        // Utiliser le service PDF existant au lieu de Playwright direct
        const pdfBuffer = await generatePDFViaService(data)
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
        
        pdfAttachment = {
          Name: `call-sheet-${data.callSheetTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
          Content: pdfBase64,
          ContentType: 'application/pdf'
        }
        
      } else {
        // URL normale, télécharger le PDF
        const pdfResponse = await fetch(data.pdfUrl)
        if (!pdfResponse.ok) {
          throw new Error(`Impossible de télécharger le PDF: ${pdfResponse.status}`)
        }
        
        const pdfBuffer = await pdfResponse.arrayBuffer()
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')
        
        pdfAttachment = {
          Name: `call-sheet-${data.callSheetTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
          Content: pdfBase64,
          ContentType: 'application/pdf'
        }
      }
    } catch (error) {
      console.error('❌ Erreur préparation PDF:', error)
      throw new Error('Impossible de préparer le PDF pour l\'email')
    }

    // Envoyer l'email
    const client = getPostmarkClient()
    const result = await client.sendEmail({
      From: POSTMARK_FROM_EMAIL,
      To: data.recipients.map(r => `${r.name} <${r.email}>`).join(', '),
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      Attachments: pdfAttachment ? [pdfAttachment] : undefined,
      Tag: 'call-sheet',
      Metadata: {
        callSheetId: data.callSheetId,
        projectName: data.projectName,
        shootDate: data.shootDate
      }
    })

    return {
      success: true,
      messageId: result.MessageID,
      status: 'sent',
      recipients: data.recipients.map(recipient => ({
        email: recipient.email,
        status: 'sent' as const
      }))
    }

  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error)
    
    return {
      success: false,
      error: error.message || 'Erreur inconnue lors de l\'envoi',
      recipients: data.recipients.map(recipient => ({
        email: recipient.email,
        status: 'failed' as const,
        error: error.message
      }))
    }
  }
}

/**
 * Valide une liste d'adresses email
 */
export function validateEmailRecipients(recipients: EmailRecipient[]): {
  valid: EmailRecipient[]
  invalid: { email: string; error: string }[]
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const valid: EmailRecipient[] = []
  const invalid: { email: string; error: string }[] = []

  for (const recipient of recipients) {
    if (!recipient.email || typeof recipient.email !== 'string') {
      invalid.push({ email: recipient.email || '', error: 'Email manquant' })
      continue
    }

    if (!emailRegex.test(recipient.email)) {
      invalid.push({ email: recipient.email, error: 'Format email invalide' })
      continue
    }

    if (!recipient.name || typeof recipient.name !== 'string') {
      invalid.push({ email: recipient.email, error: 'Nom manquant' })
      continue
    }

    valid.push(recipient)
  }

  return { valid, invalid }
}

/**
 * Génère un PDF via le service PDF externe pour l'email
 */
async function generatePDFViaService(data: CallSheetEmailData): Promise<Buffer> {
  const PDF_SERVICE_URL = process.env.NEXT_PUBLIC_PDF_SERVICE_URL || 'http://localhost:3001'
  
  try {
    console.log('📄 Appel service PDF pour email:', PDF_SERVICE_URL)
    
    const response = await fetch(`${PDF_SERVICE_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callSheetId: data.callSheetId,
        token: `email-temp-${Date.now()}`,
        format: 'A4'
      })
    })

    if (!response.ok) {
      throw new Error(`Service PDF erreur: ${response.status}`)
    }

    // Le service PDF retourne directement le buffer PDF en mode démo
    const pdfBuffer = await response.arrayBuffer()
    return Buffer.from(pdfBuffer)
    
  } catch (error) {
    console.error('❌ Erreur service PDF pour email:', error)
    throw new Error('Service PDF indisponible pour l\'email')
  }
}
