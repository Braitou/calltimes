'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setMessage(`Erreur: ${error.message}`)
      } else if (data.user) {
        console.log('[SIGNUP] Signup data:', data)
        
        if (data.session) {
          setMessage('Compte cree et connecte ! Redirection vers dashboard...')
          // NAVIGATION FORCEE vers dashboard
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
        } else {
          // Auto-signin si pas de session
          setMessage('Compte cree, connexion automatique...')
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            console.error('Auto-signin failed:', signInError)
            setMessage('Compte cree ! Veuillez vous connecter.')
            setTimeout(() => {
              router.push('/auth/login')
            }, 1500)
          } else {
            console.log('[SIGNUP] Auto-signin successful:', signInData)
            setMessage('Compte cree et connecte ! Redirection vers dashboard...')
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
          }
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setMessage(`Erreur: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-call-times-black flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="text-white font-black text-4xl leading-[0.85] tracking-tight uppercase mb-4">
            CALL<br />TIMES
          </div>
          <p className="text-call-times-text-secondary text-lg">
            Join the Command Center
          </p>
        </div>

        {/* Formulaire de creation de compte */}
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader className="text-center">
            <CardTitle className="text-white font-bold text-2xl uppercase tracking-wider mb-2">
              Create Account
            </CardTitle>
            <p className="text-call-times-text-secondary">
              Rejoignez l&apos;elite des producteurs professionnels
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Simon Bandiera"
                  required
                  className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                />
              </div>

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
                  required
                  minLength={6}
                  className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                />
                <p className="text-call-times-text-disabled text-xs mt-1">
                  Minimum 6 caracteres
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded text-sm ${
                  message.includes('connecte') 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : message.includes('automatique')
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {message}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !email || !password || !fullName}
                className="w-full bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-sm uppercase tracking-wider py-3"
              >
                {loading ? 'CREATION EN COURS...' : 'DEPLOY ACCOUNT'}
              </Button>
            </form>

            {/* Lien vers connexion */}
            <div className="mt-6 pt-6 border-t border-call-times-gray-light">
              <div className="text-center">
                <p className="text-call-times-text-muted text-sm mb-2">
                  Deja membre du Command Center ?
                </p>
                <Link 
                  href="/auth/login"
                  className="text-call-times-accent hover:text-call-times-accent-hover font-bold text-sm uppercase tracking-wider"
                >
                  Connexion â†’
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-call-times-text-disabled text-sm">
            En creant un compte, vous acceptez nos conditions d&apos;utilisation.
          </p>
        </div>
      </div>
    </div>
  )
}
