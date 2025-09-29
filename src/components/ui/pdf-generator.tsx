'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react'
import { generateCallSheetPDF, downloadPDF, checkPDFServiceHealth } from '@/lib/services/pdf'

interface PDFGeneratorProps {
  callSheetId: string
  callSheetTitle: string
  disabled?: boolean
  className?: string
}

export function PDFGenerator({ 
  callSheetId, 
  callSheetTitle, 
  disabled = false,
  className = ''
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastPdfUrl, setLastPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Vérifier d'abord que le service PDF est disponible
      const serviceHealth = await checkPDFServiceHealth()
      
      if (!serviceHealth) {
        throw new Error('Service PDF temporairement indisponible. Réessayez dans quelques instants.')
      }

      // Générer le PDF
      const result = await generateCallSheetPDF({
        callSheetId,
        format: 'A4'
      })

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la génération du PDF')
      }

      if (result.pdf_url) {
        setLastPdfUrl(result.pdf_url)
        
        // Téléchargement automatique
        const filename = `${callSheetTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
        const downloaded = await downloadPDF(result.pdf_url, filename)
        
        if (!downloaded) {
          throw new Error('Erreur lors du téléchargement du PDF')
        }
      }

    } catch (error) {
      console.error('Erreur génération PDF:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAgain = async () => {
    if (!lastPdfUrl) return
    
    const filename = `${callSheetTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
    await downloadPDF(lastPdfUrl, filename)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Bouton principal de génération */}
      <Button
        onClick={handleGeneratePDF}
        disabled={disabled || isGenerating}
        className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-semibold"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Générer PDF
          </>
        )}
      </Button>

      {/* Bouton de re-téléchargement si PDF déjà généré */}
      {lastPdfUrl && !isGenerating && (
        <Button
          onClick={handleDownloadAgain}
          variant="outline"
          size="sm"
          className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-light"
        >
          <Download className="w-4 h-4 mr-1" />
          Re-télécharger
        </Button>
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm max-w-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate" title={error}>
            {error}
          </span>
        </div>
      )}
    </div>
  )
}
