'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [usePassword, setUsePassword] = useState(true) // Par defaut, utiliser mot de passe
  const router = useRouter()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`Erreur: ${error.message}`)
      } else if (data.user) {
        setMessage('SUCCESS: Connexion reussie ! Redirection...')
        // Forcer un refresh complet pour que les cookies soient bien pris en compte
        window.location.href = '/'
      }
    } catch (error) {
      setMessage(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setMessage(`Erreur: ${error.message}`)
      } else {
        setMessage('SUCCESS: Email de connexion envoye ! Verifiez votre boite mail.')
      }
    } catch (error) {
      setMessage(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-call-times-black flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-white">
            <div className="font-black text-5xl leading-[0.85] tracking-tight uppercase">
              CALL<br />TIMES
            </div>
          </Link>
        </div>

        <Card className="bg-call-times-gray-dark border-call-times-gray-light p-6">
          <CardHeader className="text-center mb-6">
            <CardTitle className="text-white font-bold text-2xl uppercase tracking-wider mb-2">
              ACCES COMMAND CENTER
            </CardTitle>
            <p className="text-call-times-text-secondary">
              Entrez vos identifiants pour acceder a votre espace de production
            </p>
          </CardHeader>

          <CardContent>
            {/* Toggle entre mot de passe et magic link */}
            <div className="flex mb-6 bg-call-times-gray-medium rounded p-1">
              <button
                type="button"
                onClick={() => setUsePassword(true)}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium uppercase tracking-wider transition-all ${
                  usePassword
                    ? 'bg-call-times-accent text-black'
                    : 'text-call-times-text-muted hover:text-white'
                }`}
              >
                Mot de Passe
              </button>
              <button
                type="button"
                onClick={() => setUsePassword(false)}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium uppercase tracking-wider transition-all ${
                  !usePassword
                    ? 'bg-call-times-accent text-black'
                    : 'text-call-times-text-muted hover:text-white'
                }`}
              >
                Magic Link
              </button>
            </div>

            <form onSubmit={usePassword ? handlePasswordLogin : handleMagicLink} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="simon@call-times.app"
                  required
                  className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                />
              </div>

              {usePassword && (
                <div>
                  <label htmlFor="password" className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    required={usePassword}
                    className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                  />
                </div>
              )}

              {message && (
                <div className={`p-4 rounded text-sm ${
                  message.includes('SUCCESS')
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email || (usePassword && !password)}
                className="w-full bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-sm uppercase tracking-wider py-3"
              >
                {loading
                  ? 'CONNEXION EN COURS...'
                  : usePassword
                    ? 'ACCESS COMMAND CENTER'
                    : 'DEPLOY ACCESS LINK'
                }
              </Button>
            </form>

            {/* Lien vers creation de compte */}
            <div className="mt-6 pt-6 border-t border-call-times-gray-light">
              <div className="text-center">
                <p className="text-call-times-text-muted text-sm mb-2">
                  Nouveau dans le Command Center ?
                </p>
                <Link
                  href="/auth/signup"
                  className="text-call-times-accent hover:text-call-times-accent-hover font-bold text-sm uppercase tracking-wider"
                >
                  Creer un Compte â†’
                </Link>
              </div>
            </div>

            {/* Info securite */}
            <div className="mt-8 pt-6 border-t border-call-times-gray-light">
              <div className="text-center space-y-2">
                <p className="text-call-times-text-disabled text-xs uppercase tracking-wider">
                  Votre securite est notre priorite.
                </p>
                <p className="text-call-times-text-disabled text-xs uppercase tracking-wider">
                  Connexion securisee via Supabase Auth.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
