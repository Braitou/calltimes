// Service client pour l'intégration avec le service PDF
import { supabase } from '@/lib/supabase/client'

const PDF_SERVICE_URL = process.env.NEXT_PUBLIC_PDF_SERVICE_URL || 'http://localhost:3001'

export interface PDFGenerationOptions {
  callSheetId: string
  format?: 'A4' | 'Letter'
}

export interface PDFGenerationResult {
  success: boolean
  pdf_url?: string
  filename?: string
  size?: number
  duration?: number
  error?: string
}

/**
 * Génère un PDF pour un Call Sheet donné
 */
export async function generateCallSheetPDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
  
  try {
    // Obtenir le token d'authentification utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    // Générer un token temporaire pour le service PDF
    // TODO: Implémenter une vraie signature JWT côté serveur
    const tempToken = `temp-${user.id}-${Date.now()}`

    const response = await fetch(`${PDF_SERVICE_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callSheetId: options.callSheetId,
        token: tempToken,
        format: options.format || 'A4'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur réseau' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    // Vérifier si la réponse est un PDF direct (mode démo) ou JSON (mode production)
    const contentType = response.headers.get('Content-Type')
    
    if (contentType && contentType.includes('application/pdf')) {
      // Mode démo : PDF direct
      const pdfBlob = await response.blob()
      const pdfUrl = URL.createObjectURL(pdfBlob)
      
      // Téléchargement automatique
      const filename = `call-sheet-demo-${options.callSheetId}.pdf`
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = pdfUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(pdfUrl)
      
      return {
        success: true,
        pdf_url: pdfUrl,
        filename: filename,
        size: pdfBlob.size,
        duration: 0
      }
    } else {
      // Mode production : JSON avec URL
      const result = await response.json()
      return result
    }

  } catch (error) {
    console.error('Erreur génération PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
}

/**
 * Télécharge un PDF généré
 */
export async function downloadPDF(pdfUrl: string, filename: string = 'call-sheet.pdf') {
  try {
    const response = await fetch(pdfUrl)
    
    if (!response.ok) {
      throw new Error('Impossible de télécharger le PDF')
    }

    const blob = await response.blob()
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    
    document.body.appendChild(a)
    a.click()
    
    // Nettoyer
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    return true

  } catch (error) {
    console.error('Erreur téléchargement PDF:', error)
    return false
  }
}

/**
 * Vérifie le statut du service PDF
 */
export async function checkPDFServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PDF_SERVICE_URL}/health`, {
      method: 'GET',
      timeout: 5000
    } as RequestInit)
    
    return response.ok
  } catch (error) {
    console.warn('Service PDF indisponible:', error)
    return false
  }
}
