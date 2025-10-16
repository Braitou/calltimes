'use client'

import { useEffect, useCallback } from 'react'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilePreview } from './FilePreview'
import { DesktopItem } from '@/types/project-hub'
import { cn } from '@/lib/utils'

interface FilePreviewModalProps {
  item: DesktopItem
  allItems: DesktopItem[]
  onClose: () => void
  onDownload?: (item: DesktopItem) => void
  onNavigate?: (item: DesktopItem) => void
}

/**
 * Modal plein écran pour prévisualiser un fichier
 * Avec navigation entre fichiers et contrôles
 */
export function FilePreviewModal({
  item,
  allItems,
  onClose,
  onDownload,
  onNavigate
}: FilePreviewModalProps) {
  // Filtrer uniquement les fichiers (pas les dossiers ni call sheets)
  const fileItems = allItems.filter(i => i.type === 'file')
  const currentIndex = fileItems.findIndex(i => i.id === item.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < fileItems.length - 1

  // Navigation avec les flèches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious()
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, hasPrevious, hasNext])

  const handlePrevious = useCallback(() => {
    if (hasPrevious && onNavigate) {
      onNavigate(fileItems[currentIndex - 1])
    }
  }, [currentIndex, hasPrevious, fileItems, onNavigate])

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(fileItems[currentIndex + 1])
    }
  }, [currentIndex, hasNext, fileItems, onNavigate])

  // Extraire les infos du fichier
  const fileData = item.data as any
  const fileName = item.name
  const mimeType = fileData.mime_type || 'application/octet-stream'
  const fileUrl = fileData.public_url || fileData.file_path || fileData.storage_path || ''

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header avec contrôles */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{fileName}</h3>
          <span className="text-xs text-gray-500 uppercase">
            {mimeType.split('/')[1] || 'Fichier'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation entre fichiers */}
          {fileItems.length > 1 && (
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className="text-white hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm text-gray-500 px-2">
                {currentIndex + 1} / {fileItems.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={!hasNext}
                className="text-white hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Actions */}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload(item)}
              className="text-white hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          )}

          {/* Fermer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Zone de preview */}
      <div className="flex-1 overflow-hidden relative">
        <FilePreview
          fileName={fileName}
          mimeType={mimeType}
          fileUrl={fileUrl}
          mode="fullscreen"
          className="w-full h-full"
        />

        {/* Boutons de navigation overlay (pour mobile/tactile) */}
        {fileItems.length > 1 && (
          <>
            {hasPrevious && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Footer avec infos supplémentaires */}
      <div className="bg-black/80 backdrop-blur-sm border-t border-gray-800 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Taille: {fileData.file_size ? formatBytes(fileData.file_size) : 'N/A'}
          </span>
          <span>
            Modifié: {fileData.updated_at ? new Date(fileData.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
          </span>
        </div>
        <div className="text-gray-600">
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">ESC</kbd> pour fermer
          {fileItems.length > 1 && (
            <>
              {' · '}
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">←</kbd>
              {' '}
              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">→</kbd>
              {' '}pour naviguer
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

