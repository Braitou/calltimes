'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { acceptProjectInvitation, validateGuestInvitation } from '@/lib/services/invitations'
import { createSupabaseClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'validating' | 'name_input' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [projectName, setProjectName] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [invitationId, setInvitationId] = useState<string>('')
  const [guestName, setGuestName] = useState<string>('')

  useEffect(() => {
    validateInvitation()
  }, [token])

  // Step 1: Validate invitation token
  const validateInvitation = async () => {
    try {
      setStatus('validating')
      console.log('🔍 Validating invitation token...')
      
      const result = await validateGuestInvitation(token)

      if (!result.success) {
        setStatus('error')
        setError(result.error || 'Invitation invalide ou expirée')
        return
      }

      console.log('✅ Invitation valid:', result)

      setProjectId(result.projectId || '')
      setProjectName(result.projectName || '')
      setRole(result.role || '')
      setEmail(result.email || '')
      setInvitationId(result.invitationId || '')

      // Si l'invitation est déjà acceptée, rediriger directement vers le projet
      if (result.invitationStatus === 'accepted') {
        console.log('✅ Invitation already accepted, redirecting to project...')
        setStatus('success')
        setTimeout(() => {
          if (result.projectId) {
            router.push(`/projects/${result.projectId}`)
          }
        }, 1000)
        return
      }

      // Si Editor, demander le nom avant de continuer
      if (result.role === 'editor') {
        setStatus('name_input')
      } else {
        // Viewer : pas besoin de nom, accepter directement
        await acceptInvitation('')
      }
    } catch (err) {
      console.error('Error validating invitation:', err)
      setStatus('error')
      setError('Une erreur inattendue est survenue')
    }
  }

  // Step 2: Accept invitation with guest name
  const acceptInvitation = async (name: string) => {
    try {
      setStatus('loading')
      console.log('🚀 Accepting invitation with name:', name)

      // 🔐 Si Editor : créer un service account temporaire
      if (role === 'editor' && email && projectId && invitationId) {
        console.log('🔐 Creating guest service account for Editor...')
        const { createGuestServiceAccount } = await import('@/lib/services/invitations')
        const serviceAccountResult = await createGuestServiceAccount(
          token, 
          email, 
          projectId, 
          invitationId,
          name // Pass the guest name
        )
        
        if (!serviceAccountResult.success) {
          console.error('❌ Failed to create service account:', serviceAccountResult.error)
          setError('Erreur lors de la création du compte temporaire')
          setStatus('error')
          return
        }
        
        console.log('✅ Guest service account created:', serviceAccountResult.userId)
      }

      // Stocker le token, rôle ET nom dans localStorage
      if (projectId) {
        localStorage.setItem(`guest_token_${projectId}`, token)
        localStorage.setItem(`guest_role_${projectId}`, role)
        if (name) {
          localStorage.setItem(`guest_name_${projectId}`, name)
        }
        console.log('💾 Stored in localStorage:', { token, role, name })
      }

      setStatus('success')

      // Redirection vers le projet
      setTimeout(() => {
        if (projectId) {
          router.push(`/projects/${projectId}`)
        }
      }, 1500)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setStatus('error')
      setError('Une erreur inattendue est survenue')
    }
  }

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (guestName.trim()) {
      acceptInvitation(guestName.trim())
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-call-times-gray-dark border-call-times-gray-light">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            {(status === 'loading' || status === 'validating') && (
              <Loader2 className="w-16 h-16 text-call-times-accent animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-16 h-16 text-call-times-accent" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          <CardTitle className="text-2xl text-white">
            {status === 'validating' && 'Validation de l\'invitation...'}
            {status === 'name_input' && 'Bienvenue ! 🎬'}
            {status === 'loading' && 'Création de votre accès...'}
            {status === 'success' && 'Accès créé avec succès !'}
            {status === 'error' && 'Invitation invalide'}
          </CardTitle>

          <CardDescription className="text-base">
            {status === 'validating' && 'Veuillez patienter pendant la validation'}
            {status === 'name_input' && projectName && `Vous avez été invité à rejoindre le projet "${projectName}"`}
            {status === 'loading' && 'Configuration de votre compte temporaire...'}
            {status === 'success' && 'Redirection vers le projet...'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>

        {status === 'error' && (
          <CardContent className="space-y-3">
            <p className="text-sm text-[#a3a3a3] text-center">
              Cette invitation a peut-être expiré ou a déjà été utilisée.
            </p>
          </CardContent>
        )}

        {status === 'name_input' && (
          <CardContent>
            <form onSubmit={handleSubmitName} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Votre nom
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Philippe Durand"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Ce nom sera visible par les autres membres du projet
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
                disabled={!guestName.trim()}
              >
                Rejoindre le projet
              </Button>
            </form>
          </CardContent>
        )}

        {status === 'success' && projectId && (
          <CardContent>
            <Link href={`/projects/${projectId}`}>
              <Button className="w-full bg-green-400 hover:bg-green-500 text-black font-bold">
                Accéder au projet maintenant
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  )
}




