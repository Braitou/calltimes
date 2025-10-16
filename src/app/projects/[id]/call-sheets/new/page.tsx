'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createCallSheet } from '@/lib/services/call-sheets'

/**
 * Page de redirection automatique
 * Crée un nouveau Call Sheet vide dans Supabase et redirige vers l'éditeur
 */
export default function NewCallSheetPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  // Flag pour éviter la double exécution en dev mode
  const hasCreated = useRef(false)

  useEffect(() => {
    // Éviter la double exécution (React 18 Strict Mode)
    if (hasCreated.current) {
      console.log('⚠️ Call sheet déjà créé, skip')
      return
    }
    
    // Créer un nouveau Call Sheet vide et rediriger vers l'éditeur
    const createAndRedirect = async () => {
      // Marquer comme créé AVANT l'appel pour éviter la double création
      hasCreated.current = true
      
      try {
        // Date du jour formatée
        const today = new Date().toISOString().split('T')[0]
        const formattedDate = new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
        
        console.log('📝 Création d\'un call sheet vide dans Supabase...')
        
        // ✅ Créer le call sheet dans Supabase
        const result = await createCallSheet({
          project_id: projectId,
          title: `Call Sheet (${formattedDate})`,
          shoot_date: today,
          status: 'draft',
          editor_data: {
            locations: [],
            important_contacts: [],
            schedule: [
              { id: 1, title: 'Call time — Production', time: '08:00' },
              { id: 2, title: 'Start shooting', time: '09:30' },
              { id: 3, title: 'Lunch', time: '13:00' },
              { id: 4, title: 'Wrap', time: '18:00' }
            ],
            team: []
          }
        })

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to create call sheet')
        }

        console.log('✅ Call sheet créé:', result.data)
        
        toast.success('Nouveau Call Sheet créé !', {
          description: 'Vous pouvez maintenant le compléter dans l\'éditeur'
        })

        // Rediriger vers l'éditeur avec l'ID du call sheet créé
        router.push(`/call-sheets/${result.data.id}/edit`)
        
      } catch (error) {
        console.error('❌ Erreur création call sheet:', error)
        toast.error('Erreur lors de la création du call sheet', {
          description: error instanceof Error ? error.message : 'Une erreur est survenue'
        })
        // En cas d'erreur, retourner au projet
        router.push(`/projects/${projectId}`)
      }
    }

    createAndRedirect()
  }, [projectId, router])

  return (
    <div className="min-h-screen bg-call-times-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-call-times-accent mb-4"></div>
        <p className="text-white text-lg font-medium">Création du Call Sheet...</p>
        <p className="text-call-times-text-muted text-sm mt-2">Redirection vers l'éditeur</p>
      </div>
    </div>
  )
}
