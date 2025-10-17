'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  getOrganizationInvitation, 
  acceptOrganizationInvitation,
  acceptOrganizationInvitationWithSignup 
} from '@/lib/services/organization-invitations'
import { supabase } from '@/lib/supabase/client'
import { Mail, Building2, Crown, User as UserIcon, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Logo } from '@/components/Logo'

interface InvitationData {
  id: string
  email: string
  role: 'owner' | 'member'
  created_at: string
  expires_at: string
  organization?: {
    id: string
    name: string
  }
  inviter?: {
    full_name: string
    email: string
  }
}

export default function AcceptOrganizationInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Signup form state
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    loadInvitation()
  }, [token])

  const loadInvitation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // 2. Charger l'invitation
      const result = await getOrganizationInvitation(token)
      
      if (!result.success || !result.data) {
        setError(result.error || 'Invitation not found')
        return
      }

      setInvitation(result.data)
    } catch (err) {
      console.error('Error loading invitation:', err)
      setError('Failed to load invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptAsLoggedInUser = async () => {
    setIsAccepting(true)
    setError(null)

    try {
      const result = await acceptOrganizationInvitation(token)
      
      if (result.success) {
        toast.success('Welcome to the organization!', {
          description: `You are now a ${invitation?.role} of ${invitation?.organization?.name}`
        })
        router.push('/dashboard')
      } else {
        setError(result.error || 'Failed to accept invitation')
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Failed to accept invitation')
    } finally {
      setIsAccepting(false)
    }
  }

  const handleAcceptWithSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Validation
    if (!fullName || fullName.length < 2) {
      setFormError('Please enter your full name')
      return
    }

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    setIsAccepting(true)

    try {
      const result = await acceptOrganizationInvitationWithSignup(token, fullName, password)
      
      if (result.success) {
        toast.success('Account created successfully!', {
          description: `Welcome to ${invitation?.organization?.name}`
        })
        router.push('/dashboard')
      } else {
        setFormError(result.error || 'Failed to create account')
      }
    } catch (err) {
      console.error('Error accepting invitation with signup:', err)
      setFormError('Failed to create account')
    } finally {
      setIsAccepting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading invitation...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-call-times-gray-dark border-call-times-gray-light max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-white text-2xl font-bold mb-3">
              Invalid Invitation
            </h2>
            <p className="text-call-times-text-muted mb-6">
              {error || 'This invitation link is not valid or has expired.'}
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-call-times-accent text-black hover:bg-call-times-accent-hover"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success - Logged in user
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="bg-call-times-gray-dark border-call-times-gray-light max-w-2xl w-full">
          <CardHeader className="text-center pb-6">
            <div className="mb-6">
              <Logo size="medium" />
            </div>
            <CardTitle className="text-white text-3xl font-bold mb-2">
              You're Invited!
            </CardTitle>
            <p className="text-call-times-text-muted">
              Join your team on Call Times
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Organization Info */}
            <div className="bg-call-times-gray-medium border border-call-times-gray-light rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold mb-1">
                    {invitation.organization?.name}
                  </h3>
                  <p className="text-call-times-text-muted text-sm mb-3">
                    Invited by <span className="text-white font-medium">{invitation.inviter?.full_name}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {invitation.role === 'owner' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-semibold rounded-full">
                        <Crown className="w-4 h-4" />
                        Owner Access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 text-sm font-semibold rounded-full">
                        <UserIcon className="w-4 h-4" />
                        Member Access
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Invitation Details */}
            <div className="bg-call-times-gray-medium rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-call-times-text-muted">Email</span>
                <span className="text-white font-medium">{invitation.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-call-times-text-muted">Role</span>
                <span className="text-white font-medium capitalize">{invitation.role}</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm leading-relaxed">
                <CheckCircle2 className="w-5 h-5 inline mr-2" />
                By accepting this invitation, you will have access to all projects, contacts, and call sheets in this organization.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-medium"
                disabled={isAccepting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptAsLoggedInUser}
                className="flex-1 bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Accept & Join'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Signup form for new users
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="bg-call-times-gray-dark border-call-times-gray-light max-w-2xl w-full">
        <CardHeader className="text-center pb-6">
          <div className="mb-6">
            <Logo size="medium" />
          </div>
          <CardTitle className="text-white text-3xl font-bold mb-2">
            Create Your Account
          </CardTitle>
          <p className="text-call-times-text-muted">
            You've been invited to join <span className="text-white font-semibold">{invitation.organization?.name}</span>
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAcceptWithSignup} className="space-y-6">
            {/* Organization Preview */}
            <div className="bg-call-times-gray-medium border border-call-times-gray-light rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-10 h-10 text-blue-500" />
                <div>
                  <p className="text-white font-semibold">{invitation.organization?.name}</p>
                  <p className="text-call-times-text-muted text-sm">
                    Invited by {invitation.inviter?.full_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Email (readonly) */}
            <div>
              <Label htmlFor="email" className="text-call-times-text-secondary text-sm font-medium mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-call-times-gray-medium border-call-times-gray-light text-white pl-10 opacity-70"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-call-times-text-secondary text-sm font-medium mb-2 block">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                disabled={isAccepting}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-call-times-text-secondary text-sm font-medium mb-2 block">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                disabled={isAccepting}
                required
                minLength={6}
              />
              <p className="text-xs text-call-times-text-disabled mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-call-times-text-secondary text-sm font-medium mb-2 block">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                disabled={isAccepting}
                required
              />
            </div>

            {/* Error Message */}
            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-call-times-gray-light">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/login')}
                className="flex-1 bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-medium"
                disabled={isAccepting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account & Join'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

