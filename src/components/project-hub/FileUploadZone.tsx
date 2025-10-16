'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FileWithPreview extends File {
  preview?: string
  progress?: number
  status?: 'uploading' | 'success' | 'error'
  error?: string
}

interface FileUploadZoneProps {
  projectId: string
  onUploadComplete?: (files: any[]) => void
  maxSize?: number // en MB
  acceptedTypes?: string[]
}

export function FileUploadZone({
  projectId,
  onUploadComplete,
  maxSize = 100,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 'video/*']
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => {
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 0,
        status: 'uploading' as const
      })
      return fileWithPreview
    })
    
    setFiles(prev => [...prev, ...filesWithPreview])
    uploadFiles(filesWithPreview)
  }, [projectId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxSize * 1024 * 1024, // Convertir MB en bytes
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>)
  })

  const uploadFiles = async (filesToUpload: FileWithPreview[]) => {
    setIsUploading(true)
    
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        try {
          // Import dynamically to avoid SSR issues
          const { uploadProjectFile } = await import('@/lib/supabase/storage')
          
          // Simulate progress (real progress tracking would need a custom implementation)
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => {
              if (f === file && (f.progress || 0) < 90) {
                return { ...f, progress: (f.progress || 0) + 10 }
              }
              return f
            }))
          }, 200)

          // 🔧 MODE SIMPLIFIÉ TEMPORAIRE : Simuler l'upload sans Supabase
          console.log('📤 [MODE MOCK] Simulating upload for:', file.name)
          
          // Attendre un peu pour simuler l'upload
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          clearInterval(progressInterval)

          // ✅ Simuler le succès
          console.log('✅ [MODE MOCK] Upload simulated successfully:', file.name)
          
          setFiles(prev => prev.map(f => 
            f === file ? { ...f, status: 'success' as const, progress: 100 } : f
          ))

          // Retourner un mock de données
          return { 
            success: true, 
            file, 
            data: {
              id: Date.now().toString(),
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              created_at: new Date().toISOString()
            }
          }
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f === file ? { 
              ...f, 
              status: 'error' as const, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            } : f
          ))
          return { success: false, file }
        }
      })

      const results = await Promise.all(uploadPromises)
      
      if (onUploadComplete) {
        const successfulUploads = results.filter(r => r.success).map(r => r.data || r.file)
        onUploadComplete(successfulUploads)
      }
    } finally {
      setIsUploading(false)
    }
  }


  const removeFile = (file: FileWithPreview) => {
    setFiles(prev => prev.filter(f => f !== file))
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  }

  const clearCompleted = () => {
    setFiles(prev => {
      prev.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview)
      })
      return prev.filter(f => f.status === 'uploading')
    })
  }

  const getFileIcon = (file: File) => {
    if (!file || !file.type) return '📎'
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word') || file.name?.endsWith('.doc') || file.name?.endsWith('.docx')) return '📝'
    if (file.type.includes('excel') || file.name?.endsWith('.xls') || file.name?.endsWith('.xlsx')) return '📊'
    if (file.type.includes('powerpoint') || file.name?.endsWith('.ppt') || file.name?.endsWith('.pptx')) return '📽️'
    if (file.type.startsWith('video/')) return '🎬'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={`
          border-2 border-dashed transition-all cursor-pointer
          ${isDragActive 
            ? 'border-call-times-accent bg-call-times-accent/5' 
            : 'border-[#333] hover:border-[#444] hover:bg-[#1a1a1a]'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="p-12 text-center">
          <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-call-times-accent' : 'text-[#666]'}`} />
          {isDragActive ? (
            <p className="text-lg text-call-times-accent font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">Drag & drop files here</p>
              <p className="text-sm text-[#a3a3a3] mb-4">
                or click to browse
              </p>
              <p className="text-xs text-[#666]">
                Supports: Images, PDF, Office docs, Videos (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              Uploading {files.filter(f => f.status === 'uploading').length} / {files.length} files
            </h3>
            {files.some(f => f.status === 'success') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-[#a3a3a3] hover:text-white"
              >
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#111] border border-[#222]"
              >
                {/* Icon or Preview */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-[#1a1a1a] rounded border border-[#333]">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-[#a3a3a3]">{formatFileSize(file.size)}</p>
                    </div>
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {file.status === 'success' && (
                        <CheckCircle2 className="w-5 h-5 text-call-times-accent" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      {file.status === 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file)}
                          className="w-5 h-5 p-0 hover:bg-transparent"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress || 0} className="h-1" />
                  )}

                  {/* Error Message */}
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

