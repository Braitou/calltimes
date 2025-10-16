'use client'

import { useState, useEffect } from 'react'
import { FileText, Image as ImageIcon, Film, FileSpreadsheet, FileCode, File, AlertCircle } from 'lucide-react'
import { getFileType } from '@/lib/utils/file-helpers'
import { cn } from '@/lib/utils'
import { SpreadsheetViewer } from './SpreadsheetViewer'
import { SpreadsheetMiniPreview } from './SpreadsheetMiniPreview'

interface FilePreviewProps {
  fileName: string
  mimeType: string
  fileUrl: string
  className?: string
  mode?: 'compact' | 'fullscreen'
  onDownload?: () => void
}

/**
 * Composant de preview de fichier intelligent
 * Supporte : PDF, Images, Vidéos, et fallback pour les autres
 */
export function FilePreview({ 
  fileName, 
  mimeType, 
  fileUrl,
  className,
  mode = 'compact',
  onDownload
}: FilePreviewProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSpreadsheet, setShowSpreadsheet] = useState(false)
  const fileType = getFileType(mimeType, fileName)
  
  // Détection Excel/CSV
  const isSpreadsheet = 
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
    mimeType === 'application/vnd.ms-excel' || // .xls
    mimeType === 'text/csv' || // .csv
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.csv')

  useEffect(() => {
    setError(false)
    setLoading(true)
  }, [fileUrl])

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    setError(true)
    setLoading(false)
  }

  // PDF Preview
  if (mimeType === 'application/pdf') {
    return (
      <div className={cn("relative w-full h-full bg-gray-900", className)}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mb-2"></div>
              <p className="text-xs text-gray-500">Chargement du PDF...</p>
            </div>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Impossible de charger le PDF</p>
              <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-green-400 hover:underline mt-2 inline-block"
              >
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            title={fileName}
          />
        )}
      </div>
    )
  }

  // Image Preview
  if (mimeType.startsWith('image/')) {
    return (
      <div className={cn("relative w-full h-full bg-gray-900 flex items-center justify-center", className)}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        )}
        {error ? (
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Impossible de charger l'image</p>
          </div>
        ) : (
          <img
            src={fileUrl}
            alt={fileName}
            className={cn(
              "max-w-full max-h-full object-contain",
              mode === 'compact' ? "rounded" : ""
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    )
  }

  // Video Preview
  if (mimeType.startsWith('video/')) {
    return (
      <div className={cn("relative w-full h-full bg-black flex items-center justify-center", className)}>
        {error ? (
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Impossible de lire la vidéo</p>
          </div>
        ) : (
          <video
            src={fileUrl}
            controls
            className="max-w-full max-h-full"
            onLoadedData={handleLoad}
            onError={handleError}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        )}
      </div>
    )
  }

  // Audio Preview
  if (mimeType.startsWith('audio/')) {
    return (
      <div className={cn("relative w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8", className)}>
        <Film className="w-16 h-16 text-purple-500 mb-4" />
        <p className="text-sm text-gray-400 mb-4 text-center">{fileName}</p>
        <audio
          src={fileUrl}
          controls
          className="w-full max-w-md"
          onLoadedData={handleLoad}
          onError={handleError}
        >
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      </div>
    )
  }

  // Text/Code Preview (pour les petits fichiers)
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return (
      <div className={cn("relative w-full h-full bg-gray-900 overflow-auto", className)}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        )}
        <iframe
          src={fileUrl}
          className="w-full h-full border-0 bg-white"
          onLoad={handleLoad}
          onError={handleError}
          title={fileName}
        />
      </div>
    )
  }

  // Fallback pour les autres types (Excel, Word, etc.)
  const getIconForType = () => {
    if (fileType === 'spreadsheet') return <FileSpreadsheet className="w-16 h-16 text-green-500" />
    if (fileType === 'document') return <FileText className="w-16 h-16 text-blue-500" />
    return <File className="w-16 h-16 text-gray-500" />
  }

  const getPreviewMessage = () => {
    if (fileType === 'spreadsheet') {
      return "Cliquez pour visualiser le tableau"
    }
    if (fileType === 'document') {
      return "Les documents Word nécessitent un téléchargement pour être consultés"
    }
    return "Ce type de fichier ne peut pas être prévisualisé directement"
  }

  // Spreadsheet Viewer en modal (plein écran)
  if (showSpreadsheet && isSpreadsheet) {
    return (
      <SpreadsheetViewer
        fileUrl={fileUrl}
        fileName={fileName}
        onClose={() => setShowSpreadsheet(false)}
        onDownload={onDownload}
      />
    )
  }

  // Mini preview pour Excel/CSV en mode compact
  if (isSpreadsheet && mode === 'compact') {
    return (
      <div className={cn("relative w-full h-full bg-gray-900", className)}>
        <SpreadsheetMiniPreview
          fileUrl={fileUrl}
          fileName={fileName}
          onExpand={() => setShowSpreadsheet(true)}
        />
      </div>
    )
  }

  // Fallback pour autres types ou mode fullscreen
  return (
    <div className={cn("relative w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8", className)}>
      {getIconForType()}
      <p className="text-sm font-medium text-white mt-4 mb-2 text-center">{fileName}</p>
      <p className="text-xs text-gray-500 text-center max-w-xs mb-4">
        {getPreviewMessage()}
      </p>
      <div className="flex gap-2">
        {isSpreadsheet ? (
          <>
            <button
              onClick={() => setShowSpreadsheet(true)}
              className="px-4 py-2 bg-green-400 hover:bg-green-500 text-black text-sm font-bold rounded transition-colors"
            >
              📊 Visualiser
            </button>
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
            >
              Télécharger
            </a>
          </>
        ) : (
          <>
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-green-400 hover:bg-green-500 text-black text-sm font-bold rounded transition-colors"
            >
              Télécharger
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
            >
              Ouvrir
            </a>
          </>
        )}
      </div>
    </div>
  )
}

