'use client'

import { useState } from 'react'
import { X, Mail, Shield, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface InviteProjectMemberModalProps {
  projectName: string
  onClose: () => void
  onInvite: (email: string, role: 'owner' | 'editor' | 'viewer') => Promise<void>
}

type Role = 'owner' | 'editor' | 'viewer'

/**
 * Modal pour inviter un membre à un projet avec choix du rôle
 */
export function InviteProjectMemberModal({
  projectName,
  onClose,
  onInvite
}: InviteProjectMemberModalProps) {
  const [email, setEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('viewer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const roles: { value: Role; label: string; description: string; icon: typeof Shield; color: string }[] = [
    {
      value: 'owner',
      label: 'Owner',
      description: 'Full access, can invite others',
      icon: Shield,
      color: 'text-green-400 border-green-400/30 bg-green-400/10'
    },
    {
      value: 'editor',
      label: 'Editor',
      description: 'Can upload, edit and delete files',
      icon: Mail,
      color: 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    },
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Read-only access, can download',
      icon: Eye,
      color: 'text-gray-400 border-gray-400/30 bg-gray-400/10'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Email requis')
      return
    }
    
    // Validation email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email invalide')
      return
    }

    setIsLoading(true)
    try {
      await onInvite(email, selectedRole)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'invitation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Inviter à {projectName}</h2>
            <p className="text-sm text-gray-500 mt-1">Partager l'accès au projet</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="philippe@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#111] border-[#333] text-white"
              disabled={isLoading}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-white">Rôle</Label>
            <div className="space-y-2">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      "hover:border-gray-600",
                      selectedRole === role.value
                        ? role.color
                        : "bg-[#111] border-[#333]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn(
                        "w-5 h-5",
                        selectedRole === role.value
                          ? role.color.split(' ')[0]
                          : "text-gray-500"
                      )} />
                      <div className="flex-1">
                        <div className={cn(
                          "font-semibold text-sm",
                          selectedRole === role.value ? "text-white" : "text-gray-400"
                        )}>
                          {role.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {role.description}
                        </div>
                      </div>
                      {selectedRole === role.value && (
                        <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-xs leading-relaxed">
              💡 <strong>Note :</strong> L'invité recevra un email avec un lien pour accepter l'invitation.
              {selectedRole === 'viewer' && ' Les viewers ont un accès lecture seule (téléchargement uniquement).'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-[#111] border-[#333] text-white hover:bg-[#222]"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-400 hover:bg-green-500 text-black font-bold"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

