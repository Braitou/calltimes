// Script de test pour valider le service PDF localement
import { chromium } from 'playwright'
import { logger } from './logger.js'

async function testPDFGeneration() {
  logger.info('Starting PDF generation test...')
  
  let browser = null
  
  try {
    // Mock data similaire à celle de la preview
    const mockCallSheetData = {
      id: 'test-1',
      title: 'Test Call Sheet - Nike Commercial',
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
      notes: 'Tournage en studio avec équipe réduite. Attention parking limité.'
    }

    // Lancer Chromium
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage({
      viewport: { width: 1200, height: 1600 }
    })

    // HTML de test (version simplifiée)
    const testHTML = generateTestHTML(mockCallSheetData)
    
    await page.setContent(testHTML, { 
      waitUntil: 'networkidle',
      timeout: 10000 
    })

    // Configuration PDF
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      }
    }

    // Générer le PDF
    const pdfBuffer = await page.pdf(pdfOptions)
    
    await browser.close()
    browser = null

    logger.info('PDF test successful', { 
      size: pdfBuffer.length,
      sizeKB: Math.round(pdfBuffer.length / 1024)
    })

    // Optionnel : sauvegarder le PDF de test
    import fs from 'fs'
    fs.writeFileSync('/tmp/test-call-sheet.pdf', pdfBuffer)
    logger.info('Test PDF saved to /tmp/test-call-sheet.pdf')

    return true

  } catch (error) {
    if (browser) {
      await browser.close()
    }
    
    logger.error('PDF test failed', { 
      error: error.message, 
      stack: error.stack 
    })
    
    return false
  }
}

function generateTestHTML(callSheet) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test Call Sheet</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
        }
        .title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 10px;
        }
        .section-title {
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <h1 class="title">${callSheet.title}</h1>
    <p><strong>Date:</strong> ${callSheet.date}</p>
    
    <div class="section">
        <div class="section-title">Lieux</div>
        ${callSheet.locations.map(loc => `
            <p><strong>${loc.name}</strong><br>
            ${loc.address}<br>
            <em>${loc.notes}</em></p>
        `).join('')}
    </div>
    
    <div class="section">
        <div class="section-title">Planning</div>
        ${callSheet.schedule.map(item => `
            <p>${item.time} - ${item.title}</p>
        `).join('')}
    </div>
    
    <div class="section">
        <div class="section-title">Équipe</div>
        ${callSheet.team.map(member => `
            <p><strong>${member.name}</strong> (${member.role}) - ${member.call_time}</p>
        `).join('')}
    </div>
    
    ${callSheet.notes ? `
    <div class="section">
        <div class="section-title">Notes</div>
        <p>${callSheet.notes}</p>
    </div>
    ` : ''}
</body>
</html>
  `
}

// Exécuter le test si ce script est appelé directement
if (process.argv[1].endsWith('test.js')) {
  testPDFGeneration()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      logger.error('Test script failed', { error: error.message })
      process.exit(1)
    })
}
