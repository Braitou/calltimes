'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { acceptInvitation } from '@/lib/services/invitations'
import Link from 'next/link'

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')

  useEffect(() => {
    handleAcceptInvitation()
  }, [token])

  const handleAcceptInvitation = async () => {
    try {
      const result = await acceptInvitation(token)

      if (!result.success) {
        setStatus('error')
        setError(result.error || 'Failed to accept invitation')
        return
      }

      setStatus('success')
      setProjectId(result.projectId || '')

      // Redirect after 2 seconds
      setTimeout(() => {
        if (result.projectId) {
          router.push(`/projects/${result.projectId}`)
        } else {
          router.push('/projects')
        }
      }, 2000)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setStatus('error')
      setError('An unexpected error occurred')
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
            {status === 'loading' && 'Accepting Invitation...'}
            {status === 'success' && 'Welcome Aboard!'}
            {status === 'error' && 'Invitation Invalid'}
          </CardTitle>

          <CardDescription className="text-base">
            {status === 'loading' && 'Please wait while we process your invitation'}
            {status === 'success' && 'You have successfully joined the project. Redirecting...'}
            {status === 'error' && error}
          </CardDescription>
        </CardHeader>

        {status === 'error' && (
          <CardContent className="space-y-3">
            <p className="text-sm text-[#a3a3a3] text-center">
              This invitation may have expired or already been used.
            </p>
            <div className="flex gap-2">
              <Link href="/projects" className="flex-1">
                <Button variant="outline" className="w-full">
                  Go to Projects
                </Button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full bg-call-times-accent text-black hover:bg-call-times-accent-hover">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        )}

        {status === 'success' && projectId && (
          <CardContent>
            <Link href={`/projects/${projectId}`}>
              <Button className="w-full bg-call-times-accent text-black hover:bg-call-times-accent-hover">
                Go to Project Now
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  )
}




