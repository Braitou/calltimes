'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { XCircle, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function NoAccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="bg-call-times-gray-dark border-call-times-gray-light max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <Logo size="medium" />
          </div>

          {/* Icon */}
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          
          {/* Title */}
          <h2 className="text-white text-2xl font-bold mb-3">
            Accès Refusé
          </h2>
          
          {/* Description */}
          <p className="text-call-times-text-muted mb-6 leading-relaxed">
            Vous n'avez pas accès à cette page. 
            <br /><br />
            Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur de votre organisation.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button
              onClick={() => router.push('/auth/login')}
              className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
            >
              Se Déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

