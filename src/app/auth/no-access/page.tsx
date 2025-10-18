'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle, ArrowLeft, UserX } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function NoAccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') // 'revoked' ou autre

  const isRevoked = reason === 'revoked'

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="bg-call-times-gray-dark border-call-times-gray-light max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <Logo size="medium" />
          </div>

          {/* Icon */}
          {isRevoked ? (
            <UserX className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          {/* Title */}
          <h2 className="text-white text-2xl font-bold mb-3">
            {isRevoked ? 'Accès Révoqué' : 'Accès Refusé'}
          </h2>
          
          {/* Description */}
          <p className="text-call-times-text-muted mb-6 leading-relaxed">
            {isRevoked ? (
              <>
                Votre accès à ce projet a été révoqué par un membre de l'équipe.
                <br /><br />
                Si vous pensez qu'il s'agit d'une erreur, contactez la personne qui vous a invité.
              </>
            ) : (
              <>
                Vous n'avez pas accès à cette page. 
                <br /><br />
                Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur de votre organisation.
              </>
            )}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!isRevoked && (
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            )}
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
            >
              {isRevoked ? 'Fermer' : 'Se Déconnecter'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

