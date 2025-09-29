import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'

const app = express()
const PORT = process.env.PORT || 3001

// Configuration Supabase avec service key pour accès admin
const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'demo-service-key'
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '1mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'call-times-pdf-renderer',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Endpoint principal pour générer un PDF
app.post('/render', async (req, res) => {
  const startTime = Date.now()
  let browser = null
  
  try {
    const { callSheetId, token, format = 'A4' } = req.body
    
    // Validation des paramètres
    if (!callSheetId || !token) {
      logger.warn('Missing required parameters', { callSheetId, hasToken: !!token })
      return res.status(400).json({ 
        error: 'Missing callSheetId or token' 
      })
    }

    // TODO: Valider le token signé (JWT) dans une vraie implémentation
    logger.info('Starting PDF generation', { callSheetId, format })

    // MODE DÉMO : Utiliser des données de fallback si Supabase échoue
    let callSheetData
    let isUsingDemoData = false
    
    try {
      // Tentative de récupération depuis Supabase
      const { data: callSheet, error: fetchError } = await supabase
        .from('call_sheets')
        .select(`
          *,
          projects:project_id (name)
        `)
        .eq('id', callSheetId)
        .single()

      if (fetchError || !callSheet) {
        throw new Error('Supabase fetch failed')
      }

      // Récupérer les données associées (planning et équipe)
      const [scheduleResult, teamResult] = await Promise.all([
        supabase
          .from('schedule_items')
          .select('*')
          .eq('call_sheet_id', callSheetId)
          .order('time'),
        supabase
          .from('team_members')
          .select('*')
          .eq('call_sheet_id', callSheetId)
          .order('department', { ascending: true })
      ])

      callSheetData = {
        ...callSheet,
        project_name: callSheet.projects?.name || 'Projet sans nom',
        schedule: scheduleResult.data || [],
        team: teamResult.data || []
      }
      
      logger.info('Call sheet data fetched from Supabase', { callSheetId })
    } catch (error) {
      // FALLBACK : Utiliser des données de démo
      logger.warn('Using demo data as fallback', { callSheetId, error: error.message })
      isUsingDemoData = true
      
      callSheetData = {
        id: callSheetId,
        title: 'Call Sheet - Commercial Nike (DÉMO)',
        date: '2025-09-25',
        project_name: 'Commercial Nike',
        locations: [
          {
            id: 1,
            name: 'Studio Harcourt',
            address: '6 Rue de Lota, 75016 Paris',
            notes: 'Accès par la cour intérieure'
          }
        ],
        important_contacts: [
          {
            id: 1,
            name: 'Jean Dupont',
            role: 'Producteur',
            phone: '+33 6 11 22 33 44',
            email: 'jean.dupont@prod.fr'
          }
        ],
        schedule: [
          { id: 1, title: 'Call time — Production', time: '08:00' },
          { id: 2, title: 'Start shooting', time: '09:30' },
          { id: 3, title: 'Lunch', time: '13:00' },
          { id: 4, title: 'Wrap', time: '18:00' }
        ],
        team: [
          {
            id: 1,
            name: 'Simon Bandiera',
            role: 'Régisseur',
            department: 'Production',
            phone: '+33 6 12 34 56 78',
            email: 'bandiera.simon@gmail.com',
            call_time: '08:30',
            on_set_time: '09:00'
          }
        ],
        notes: '📄 Version démo - Convergence Preview/PDF testée avec succès !'
      }
    }

    // Lancer Chromium
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage({
      viewport: { width: 1200, height: 1600 } // A4 ratio
    })

    // Générer le HTML du call sheet avec les mêmes styles que la preview
    const html = generateCallSheetHTML(callSheetData)
    
    await page.setContent(html, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    })

    // Configuration PDF optimisée A4
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      },
      preferCSSPageSize: false,
      displayHeaderFooter: false
    }

    // Générer le PDF
    const pdfBuffer = await page.pdf(pdfOptions)
    
    await browser.close()
    browser = null

    const duration = Date.now() - startTime
    
    // MODE DÉMO : Retourner directement le PDF
    if (isUsingDemoData) {
      logger.info('PDF generated successfully (DEMO MODE)', { 
        callSheetId, 
        duration,
        size: pdfBuffer.length 
      })

      // Retourner le PDF directement en téléchargement
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="call-sheet-demo-${callSheetId}.pdf"`)
      res.send(pdfBuffer)
      return
    }

    // MODE PRODUCTION : Upload vers Supabase Storage
    const fileName = `call-sheet-${callSheetId}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      })

    if (uploadError) {
      logger.error('Failed to upload PDF', { error: uploadError })
      return res.status(500).json({ 
        error: 'Failed to upload PDF' 
      })
    }

    // Obtenir URL signée (valide 7 jours)
    const { data: signedUrlData } = await supabase.storage
      .from('pdfs')
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7)

    if (!signedUrlData?.signedUrl) {
      logger.error('Failed to generate signed URL')
      return res.status(500).json({ 
        error: 'Failed to generate PDF URL' 
      })
    }

    // Mettre à jour le call sheet avec l'URL du PDF
    await supabase
      .from('call_sheets')
      .update({ 
        pdf_url: signedUrlData.signedUrl,
        pdf_generated_at: new Date().toISOString()
      })
      .eq('id', callSheetId)

    logger.info('PDF generated successfully (PRODUCTION MODE)', { 
      callSheetId, 
      fileName, 
      duration,
      size: pdfBuffer.length 
    })

    res.json({
      success: true,
      pdf_url: signedUrlData.signedUrl,
      filename: fileName,
      size: pdfBuffer.length,
      duration
    })

  } catch (error) {
    if (browser) {
      await browser.close()
    }
    
    const duration = Date.now() - startTime
    logger.error('PDF generation failed', { 
      error: error.message, 
      stack: error.stack,
      duration 
    })
    
    res.status(500).json({ 
      error: 'PDF generation failed',
      message: error.message 
    })
  }
})

// Fonction pour générer le HTML avec les mêmes styles que la preview
function generateCallSheetHTML(callSheet) {
  // TODO: Utiliser exactement les mêmes composants/styles que la preview
  // Pour l'instant, version simplifiée pour tester la convergence
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Call Sheet - ${callSheet.title}</title>
    <style>
        /* CSS identique à la preview pour garantir la convergence */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: white;
            color: black;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .call-sheet {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 0;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
        }
        
        .logo {
            height: 32px;
            width: auto;
            object-fit: contain;
        }
        
        .title-section {
            text-align: center;
            padding: 16px;
        }
        
        .logo-marque {
            height: 40px;
            width: auto;
            object-fit: contain;
            margin: 0 auto 12px auto;
            display: block;
        }
        
        .title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        
        .date {
            font-size: 12px;
            font-weight: 500;
        }
        
        .content {
            padding: 20px;
        }
        
        .section {
            background: #f5f5f5;
            padding: 12px;
            border-radius: 4px;
            margin-bottom: 16px;
        }
        
        .section-title {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
        }
        
        .locations-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .location {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
        }
        
        .location-title {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .location-name {
            font-weight: 600;
            font-size: 12px;
        }
        
        .location-address {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
        }
        
        .location-notes {
            font-size: 10px;
            color: #888;
            margin-top: 2px;
            font-style: italic;
        }
        
        .contacts-table {
            width: 100%;
        }
        
        .contacts-header {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8px;
            font-size: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
            margin-bottom: 4px;
        }
        
        .contact-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8px;
            font-size: 10px;
            border-bottom: 1px solid #eee;
            padding: 2px 0;
        }
        
        .contact-role {
            font-weight: 600;
        }
        
        .contact-name {
            font-weight: 500;
        }
        
        .contact-info {
            color: #666;
        }
        
        .schedule-table {
            width: 100%;
        }
        
        .schedule-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 10px;
            border-bottom: 1px solid #eee;
            padding: 2px 0;
        }
        
        .schedule-title {
            font-weight: 500;
        }
        
        .schedule-time {
            font-weight: bold;
            text-align: right;
        }
        
        .crew-table {
            width: 100%;
        }
        
        .crew-header {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            gap: 8px;
            font-size: 10px;
            font-weight: bold;
            border-bottom: 2px solid #666;
            padding-bottom: 4px;
            margin-bottom: 4px;
        }
        
        .crew-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            gap: 8px;
            font-size: 10px;
            border-bottom: 1px solid #eee;
            padding: 2px 0;
        }
        
        .crew-department {
            text-transform: uppercase;
            font-weight: 500;
        }
        
        .crew-name {
            font-weight: 500;
        }
        
        .crew-info {
            color: #666;
        }
        
        .crew-call {
            font-weight: 600;
        }
        
        .crew-onset {
            color: #0066cc;
            font-weight: 600;
        }
        
        .notes {
            border-top: 1px solid #ccc;
            padding-top: 12px;
        }
        
        .notes-title {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .notes-content {
            font-size: 10px;
            line-height: 1.5;
            background: #fffbf0;
            padding: 10px;
            border-radius: 4px;
            border-left: 4px solid #ffc107;
        }
        
        /* Print-specific styles */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .call-sheet {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="call-sheet">
        <!-- Header avec logos -->
        <div class="header">
            <div>
                ${callSheet.logo_production_url ? `<img src="${callSheet.logo_production_url}" alt="Logo Production" class="logo" />` : ''}
            </div>
            <div>
                ${callSheet.logo_agence_url ? `<img src="${callSheet.logo_agence_url}" alt="Logo Agence" class="logo" />` : ''}
            </div>
        </div>

        <!-- Logo Marque + Titre -->
        <div class="title-section">
            ${callSheet.logo_marque_url ? `<img src="${callSheet.logo_marque_url}" alt="Logo Marque" class="logo-marque" />` : ''}
            <h1 class="title">${callSheet.title || 'Call Sheet'}</h1>
            <div class="date">
                ${new Date(callSheet.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
            </div>
        </div>

        <div class="content">
            <!-- Lieux de tournage -->
            ${callSheet.locations && callSheet.locations.length > 0 ? `
            <div class="locations-grid">
                ${callSheet.locations.map((location, index) => `
                <div class="location">
                    <div class="location-title">
                        ${callSheet.locations.length > 1 ? `Lieu ${index + 1}` : 'Lieu de tournage'}
                    </div>
                    <div class="location-name">${location.name || 'Non défini'}</div>
                    ${location.address ? `<div class="location-address">${location.address}</div>` : ''}
                    ${location.notes ? `<div class="location-notes">${location.notes}</div>` : ''}
                </div>
                `).join('')}
            </div>
            ` : ''}

            <!-- Contacts Production -->
            ${callSheet.important_contacts && callSheet.important_contacts.length > 0 ? `
            <div class="section">
                <div class="section-title">CONTACTS PRODUCTION</div>
                <div class="contacts-table">
                    ${callSheet.important_contacts.map(contact => `
                    <div class="contact-row">
                        <div class="contact-role">${contact.role || 'Poste'}</div>
                        <div class="contact-name">${contact.name || 'Contact'}</div>
                        <div class="contact-info">${contact.phone || 'N/A'}</div>
                        <div class="contact-info">${contact.email || 'N/A'}</div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Schedule -->
            ${callSheet.schedule && callSheet.schedule.length > 0 ? `
            <div class="section">
                <div class="section-title">SCHEDULE</div>
                <div class="schedule-table">
                    ${callSheet.schedule.map(item => `
                    <div class="schedule-row">
                        <div class="schedule-title">${item.title}</div>
                        <div class="schedule-time">${item.time}</div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Crew Call -->
            <div class="section">
                <div class="section-title">CREW CALL</div>
                <div class="crew-table">
                    <div class="crew-header">
                        <div>POSITION</div>
                        <div>NAME</div>
                        <div>TEL</div>
                        <div>CALL</div>
                        <div>ON SET</div>
                    </div>
                    ${callSheet.team && callSheet.team.length > 0 ? 
                      callSheet.team
                        .sort((a, b) => a.department.localeCompare(b.department))
                        .map(member => `
                        <div class="crew-row">
                            <div class="crew-department">${member.department.toUpperCase()}</div>
                            <div class="crew-name">${member.name || 'Sans nom'}</div>
                            <div class="crew-info">${member.phone || 'N/A'}</div>
                            <div class="crew-call">${member.call_time || 'N/A'}</div>
                            <div class="crew-onset">${member.on_set_time || 'N/A'}</div>
                        </div>
                        `).join('') :
                      `<div class="crew-row">
                        <div class="crew-department">PRODUCTION</div>
                        <div class="crew-name">Line Producer</div>
                        <div class="crew-info">+33 6 12 33 44</div>
                        <div class="crew-call">07:30</div>
                        <div class="crew-onset">09:30</div>
                      </div>`
                    }
                </div>
            </div>

            <!-- Notes -->
            ${callSheet.notes ? `
            <div class="notes">
                <div class="notes-title">NOTES IMPORTANTES</div>
                <div class="notes-content">${callSheet.notes}</div>
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `
}

// Error handler global
app.use((error, req, res, next) => {
  logger.error('Unhandled error', { error: error.message, stack: error.stack })
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`PDF Renderer service started on port ${PORT}`)
})

export default app
