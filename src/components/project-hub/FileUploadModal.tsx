'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, File, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadProjectFile } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/utils/file-helpers'

interface FileUploadModalProps {
  projectId: string
  onClose: () => void
  onUploadComplete: (files: any[]) => void
}

interface UploadingFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  data?: any
}

/**
 * Modal d'upload de fichiers avec drag & drop
 */
export function FileUploadModal({
  projectId,
  onClose,
  onUploadComplete
}: FileUploadModalProps) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : []
    addFiles(selectedFiles)
  }, [])

  const addFiles = (newFiles: File[]) => {
    const uploadingFiles: UploadingFile[] = newFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0
    }))
    setFiles(prev => [...prev, ...uploadingFiles])
    
    // Démarrer l'upload automatiquement
    uploadingFiles.forEach((uf, index) => {
      uploadFile(uf, files.length + index)
    })
  }

  const uploadFile = async (uploadingFile: UploadingFile, index: number) => {
    // Mettre à jour le statut
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading' as const } : f
    ))

    try {
      // Simuler la progression (Supabase ne fournit pas de callback de progression)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map((f, i) => 
          i === index && f.progress < 90 
            ? { ...f, progress: f.progress + 10 } 
            : f
        ))
      }, 200)

      // Upload réel
      const result = await uploadProjectFile(projectId, uploadingFile.file)

      clearInterval(progressInterval)

      if (result.success) {
        setFiles(prev => prev.map((f, i) => 
          i === index 
            ? { ...f, status: 'success' as const, progress: 100, data: result.data } 
            : f
        ))
      } else {
        setFiles(prev => prev.map((f, i) => 
          i === index 
            ? { ...f, status: 'error' as const, error: result.error } 
            : f
        ))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { ...f, status: 'error' as const, error: 'Erreur inattendue' } 
          : f
      ))
    }
  }

  const handleClose = () => {
    const successFiles = files.filter(f => f.status === 'success' && f.data)
    if (successFiles.length > 0) {
      onUploadComplete(successFiles.map(f => f.data))
    }
    onClose()
  }

  const allDone = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error')
  const successCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[#333] rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <h2 className="text-xl font-bold">Upload de fichiers</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-[#222]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {files.length === 0 ? (
            // Drop zone
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-green-400 bg-green-400/10"
                  : "border-[#333] hover:border-[#444] hover:bg-[#0a0a0a]"
              )}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium mb-2">
                Glissez vos fichiers ici
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou cliquez pour sélectionner
              </p>
              <Button className="bg-green-400 hover:bg-green-500 text-black">
                Parcourir les fichiers
              </Button>
            </div>
          ) : (
            // Liste des fichiers
            <div className="space-y-3">
              {files.map((uploadingFile, index) => (
                <div
                  key={index}
                  className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {uploadingFile.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : uploadingFile.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <File className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{uploadingFile.file.name}</p>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatBytes(uploadingFile.file.size)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {uploadingFile.status === 'uploading' && (
                        <div className="w-full bg-[#222] rounded-full h-1.5 mb-1">
                          <div
                            className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadingFile.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Status */}
                      <p className={cn(
                        "text-xs",
                        uploadingFile.status === 'success' && "text-green-400",
                        uploadingFile.status === 'error' && "text-red-400",
                        uploadingFile.status === 'uploading' && "text-gray-500",
                        uploadingFile.status === 'pending' && "text-gray-600"
                      )}>
                        {uploadingFile.status === 'success' && '✓ Uploadé'}
                        {uploadingFile.status === 'error' && `✗ ${uploadingFile.error || 'Erreur'}`}
                        {uploadingFile.status === 'uploading' && `Upload en cours... ${uploadingFile.progress}%`}
                        {uploadingFile.status === 'pending' && 'En attente...'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Footer */}
        {files.length > 0 && (
          <div className="p-6 border-t border-[#222]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {allDone ? (
                  <>
                    {successCount > 0 && (
                      <span className="text-green-400 font-medium">
                        {successCount} fichier{successCount > 1 ? 's' : ''} uploadé{successCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {errorCount > 0 && (
                      <span className="text-red-400 font-medium ml-3">
                        {errorCount} erreur{errorCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                ) : (
                  <span>Upload en cours...</span>
                )}
              </div>
              <div className="flex gap-2">
                {!allDone && (
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#222] hover:bg-[#333] border-[#333]"
                  >
                    Ajouter des fichiers
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  disabled={!allDone}
                  className="bg-green-400 hover:bg-green-500 text-black"
                >
                  {allDone ? 'Terminer' : 'Fermer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

