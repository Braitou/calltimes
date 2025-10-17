'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Crown, User as UserIcon } from 'lucide-react'

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  onInvite: (email: string, role: 'owner' | 'member') => Promise<void>
  currentMemberCount: number
  maxMembers: number
}

export function InviteMemberModal({
  open,
  onClose,
  onInvite,
  currentMemberCount,
  maxMembers
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'member'>('member')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email) {
      setError('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (currentMemberCount >= maxMembers) {
      setError(`Organization limit reached (max ${maxMembers} members)`)
      return
    }

    setIsLoading(true)
    try {
      await onInvite(email, role)
      // Reset form
      setEmail('')
      setRole('member')
    } catch (err) {
      setError('Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setRole('member')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-call-times-gray-dark border-call-times-gray-light text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="text-call-times-text-secondary text-sm font-medium mb-2 block">
              Email Address *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled pl-10"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label className="text-call-times-text-secondary text-sm font-medium mb-3 block">
              Role *
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Member Option */}
              <button
                type="button"
                onClick={() => setRole('member')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${role === 'member' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-call-times-gray-light bg-call-times-gray-medium hover:border-gray-600'
                  }
                `}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${role === 'member' ? 'bg-blue-500/20' : 'bg-gray-700'}
                  `}>
                    <UserIcon className={`w-6 h-6 ${role === 'member' ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-semibold ${role === 'member' ? 'text-blue-500' : 'text-white'}`}>
                    Member
                  </span>
                  <span className="text-xs text-call-times-text-muted text-center">
                    Can access all projects
                  </span>
                </div>
              </button>

              {/* Owner Option */}
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${role === 'owner' 
                    ? 'border-yellow-500 bg-yellow-500/10' 
                    : 'border-call-times-gray-light bg-call-times-gray-medium hover:border-gray-600'
                  }
                `}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${role === 'owner' ? 'bg-yellow-500/20' : 'bg-gray-700'}
                  `}>
                    <Crown className={`w-6 h-6 ${role === 'owner' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  </div>
                  <span className={`font-semibold ${role === 'owner' ? 'text-yellow-500' : 'text-white'}`}>
                    Owner
                  </span>
                  <span className="text-xs text-call-times-text-muted text-center">
                    Full admin access
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm leading-relaxed">
              <strong>Members</strong> can view and edit all projects, contacts, and call sheets. 
              <strong className="block mt-2">Owners</strong> have full admin access including team management.
            </p>
          </div>

          {/* Member Limit Info */}
          <div className="bg-call-times-gray-medium border border-call-times-gray-light rounded-lg p-3">
            <p className="text-call-times-text-muted text-sm">
              <span className="font-semibold text-white">{currentMemberCount} / {maxMembers}</span> members used
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-call-times-gray-light">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-medium"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
              disabled={isLoading || currentMemberCount >= maxMembers}
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

