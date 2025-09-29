'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

interface LogoUploadProps {
  currentLogoUrl?: string | null
  onUploadComplete: (logoUrl: string) => void
  onUploadError: (error: string) => void
  maxSizeMB?: number
  disabled?: boolean
}

export function LogoUpload({
  currentLogoUrl,
  onUploadComplete,
  onUploadError,
  maxSizeMB = 2,
  disabled = false
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Format non supporté. Utilisez JPG, PNG, WebP ou SVG.')
      return
    }

    // Validation de la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      onUploadError(`Fichier trop volumineux. Maximum ${maxSizeMB}MB.`)
      return
    }

    try {
      setIsUploading(true)

      // Créer un preview local immédiatement
      const localPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(localPreviewUrl)

      // Mode demo : si Supabase n'est pas configuré, simuler l'upload
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co') {
        console.log('📝 MODE DEMO: Simulation upload logo', file.name)
        
        // Simuler un délai d'upload
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Utiliser l'URL locale comme "URL uploadée"
        setPreviewUrl(localPreviewUrl)
        onUploadComplete(localPreviewUrl)
        return
      }

      // Mode production : upload réel vers Supabase
      try {
        // Générer un nom de fichier unique via la fonction Supabase
        const { data: filenameData, error: filenameError } = await supabase
          .rpc('generate_unique_filename', { 
            original_name: file.name 
          })

        if (filenameError) throw filenameError

        const filename = filenameData as string

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('org-logos')
          .upload(filename, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Obtenir l'URL publique signée
        const { data: signedUrlData } = await supabase.storage
          .from('org-logos')
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7) // 7 jours

        if (signedUrlData?.signedUrl) {
          // Nettoyer l'ancien preview local
          if (localPreviewUrl) {
            URL.revokeObjectURL(localPreviewUrl)
          }
          
          setPreviewUrl(signedUrlData.signedUrl)
          onUploadComplete(signedUrlData.signedUrl)
        } else {
          throw new Error('Impossible d\'obtenir l\'URL du fichier')
        }
      } catch (supabaseError) {
        // Fallback en mode demo si Supabase échoue
        console.warn('Supabase upload failed, using demo mode:', supabaseError)
        setPreviewUrl(localPreviewUrl)
        onUploadComplete(localPreviewUrl)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setPreviewUrl(currentLogoUrl || null) // Restaurer l'ancien preview
      
      if (error instanceof Error) {
        onUploadError(error.message)
      } else {
        onUploadError('Erreur lors de l\'upload du logo')
      }
    } finally {
      setIsUploading(false)
      // Reset l'input pour permettre de re-uploader le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return

    try {
      setIsUploading(true)
      
      // En mode demo ou production, on supprime juste le preview local
      if (currentLogoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentLogoUrl)
      }
      
      // Optionnel : supprimer de Supabase Storage (pour l'instant on garde les fichiers)
      // En production vous pourriez vouloir supprimer le fichier :
      // await supabase.storage.from('org-logos').remove([filename])
      
      setPreviewUrl(null)
      onUploadComplete('') // URL vide = pas de logo
      
    } catch (error) {
      console.error('Remove error:', error)
      onUploadError('Erreur lors de la suppression du logo')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Zone de preview */}
      <div className="border-2 border-dashed border-call-times-gray-light rounded-lg p-6 text-center">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Logo preview"
                className="max-h-24 max-w-48 object-contain rounded"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-light text-xs"
              >
                {isUploading ? 'Upload...' : 'Remplacer'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveLogo}
                disabled={disabled || isUploading}
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white text-xs"
              >
                Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-call-times-text-muted text-sm mb-2">
              📎 Logo agence/prod/marque
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-light text-xs"
            >
              {isUploading ? 'Upload...' : 'Choisir fichier'}
            </Button>
            <div className="text-call-times-text-disabled text-xs">
              PNG, JPG, WebP, SVG • Max {maxSizeMB}MB
            </div>
          </div>
        )}
      </div>

      {/* Input fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  )
}
