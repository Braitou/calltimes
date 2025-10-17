'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { validateGuestInvitation } from '@/lib/services/invitations'
import Link from 'next/link'

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [projectName, setProjectName] = useState<string>('')

  useEffect(() => {
    handleAcceptInvitation()
  }, [token])

  const handleAcceptInvitation = async () => {
    try {
      // Valider le token et obtenir les infos du projet
      const result = await validateGuestInvitation(token)

      if (!result.success) {
        setStatus('error')
        setError(result.error || 'Invitation invalide ou expirée')
        return
      }

      setStatus('success')
      setProjectId(result.projectId || '')
      setProjectName(result.projectName || '')

      // Stocker le token guest dans localStorage pour l'accès
      if (result.projectId) {
        localStorage.setItem(`guest_token_${result.projectId}`, token)
      }

      // Redirection immédiate vers le projet
      setTimeout(() => {
        if (result.projectId) {
          router.push(`/projects/${result.projectId}`)
        }
      }, 1500)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setStatus('error')
      setError('Une erreur inattendue est survenue')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-call-times-accent animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-16 h-16 text-call-times-accent" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          <CardTitle className="text-2xl">
            {status === 'loading' && 'Validation de l\'invitation...'}
            {status === 'success' && 'Bienvenue ! 🎬'}
            {status === 'error' && 'Invitation invalide'}
          </CardTitle>

          <CardDescription className="text-base">
            {status === 'loading' && 'Veuillez patienter pendant la validation'}
            {status === 'success' && projectName && `Vous accédez au projet "${projectName}". Redirection...`}
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




