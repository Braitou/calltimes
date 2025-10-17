'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout } from '@/components/layout'
import { toast } from 'sonner'
import { 
  listOrganizationMembers, 
  createOrganizationInvitation,
  revokeOrganizationInvitation 
} from '@/lib/services/organization-invitations'
import { supabase } from '@/lib/supabase/client'
import { Plus, Mail, MoreVertical, Crown, User as UserIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InviteMemberModal } from '@/components/settings/InviteMemberModal'

// Mock user pour le layout
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

interface Member {
  id: string
  user_id: string
  email: string
  role: 'owner' | 'member'
  created_at: string
  user?: {
    id: string
    full_name: string
    email: string
  }
}

interface PendingInvitation {
  id: string
  email: string
  role: 'owner' | 'member'
  created_at: string
  expires_at: string
  inviter?: {
    full_name: string
  }
}

export default function TeamSettingsPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'member'>('member')
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    setIsLoading(true)
    try {
      // 1. Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUserId(user.id)

      // 2. Récupérer l'organisation de l'utilisateur
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        toast.error('Organization not found')
        router.push('/dashboard')
        return
      }

      setOrganizationId(membership.organization_id)
      setCurrentUserRole(membership.role as 'owner' | 'member')

      // 3. Charger les membres et invitations
      const result = await listOrganizationMembers(membership.organization_id)
      if (result.success) {
        setMembers(result.data.members)
        setPendingInvitations(result.data.pending_invitations)
      } else {
        toast.error('Error loading team data')
      }
    } catch (error) {
      console.error('Error loading team:', error)
      toast.error('Failed to load team')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (email: string, role: 'owner' | 'member') => {
    if (!organizationId) return

    const result = await createOrganizationInvitation(organizationId, email, role)
    
    if (result.success) {
      toast.success(`Invitation sent to ${email}`)
      setShowInviteModal(false)
      loadTeamData() // Refresh
    } else {
      toast.error(result.error || 'Failed to send invitation')
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return

    const result = await revokeOrganizationInvitation(invitationId)
    
    if (result.success) {
      toast.success('Invitation revoked')
      loadTeamData()
    } else {
      toast.error(result.error || 'Failed to revoke invitation')
    }
  }

  const getRoleBadge = (role: 'owner' | 'member') => {
    if (role === 'owner') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-semibold rounded-full">
          <Crown className="w-3 h-3" />
          Owner
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-semibold rounded-full">
        <UserIcon className="w-3 h-3" />
        Member
      </span>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  if (isLoading) {
    return (
      <PageLayout user={mockUser} showSidebar={false}>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
        </div>
      </PageLayout>
    )
  }

  const totalMembers = members.length + pendingInvitations.length
  const canInvite = currentUserRole === 'owner' && totalMembers < 20

  return (
    <PageLayout user={mockUser} showSidebar={false}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-[3rem] mb-3">
              Team Management
            </h1>
            <p className="section-header text-sm">
              MANAGE YOUR ORGANIZATION MEMBERS
            </p>
          </div>
          {canInvite && (
            <Button 
              onClick={() => setShowInviteModal(true)}
              className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold"
            >
              <Plus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardContent className="p-6">
            <p className="text-call-times-text-muted text-sm uppercase tracking-wider mb-2">
              Total Members
            </p>
            <p className="text-white text-4xl font-bold">
              {members.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardContent className="p-6">
            <p className="text-call-times-text-muted text-sm uppercase tracking-wider mb-2">
              Pending Invitations
            </p>
            <p className="text-white text-4xl font-bold">
              {pendingInvitations.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardContent className="p-6">
            <p className="text-call-times-text-muted text-sm uppercase tracking-wider mb-2">
              Available Slots
            </p>
            <p className="text-white text-4xl font-bold">
              {20 - totalMembers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Members */}
      <Card className="bg-call-times-gray-dark border-call-times-gray-light mb-8">
        <CardHeader>
          <CardTitle className="text-white font-bold text-xl uppercase tracking-tight">
            Active Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <p className="text-lg font-medium">You are alone for now</p>
              <p className="text-sm mt-2">Invite team members to collaborate on projects</p>
            </div>
          ) : (
            <div className="divide-y divide-call-times-gray-light">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-4 hover:bg-call-times-gray-medium transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(member.user?.full_name || member.email)}
                    </div>
                    
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {member.user?.full_name || 'Unknown'}
                        </p>
                        {member.user_id === currentUserId && (
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-semibold rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-call-times-text-muted">{member.email}</p>
                      <p className="text-xs text-call-times-text-disabled mt-1">
                        Joined {formatDate(member.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Role & Actions */}
                  <div className="flex items-center gap-4">
                    {getRoleBadge(member.role)}
                    
                    {currentUserRole === 'owner' && member.user_id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-call-times-text-muted hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-call-times-gray-dark border-call-times-gray-light text-white">
                          <DropdownMenuItem 
                            className="text-red-500 hover:bg-call-times-gray-medium cursor-pointer"
                            onClick={() => toast.info('Remove member feature coming soon')}
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader>
            <CardTitle className="text-white font-bold text-xl uppercase tracking-tight">
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-call-times-gray-light">
              {pendingInvitations.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="flex items-center justify-between p-4 hover:bg-call-times-gray-medium transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-gray-400" />
                    </div>
                    
                    {/* Info */}
                    <div>
                      <p className="font-medium text-white">{invitation.email}</p>
                      <p className="text-sm text-call-times-text-muted">
                        Invited by {invitation.inviter?.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-call-times-text-disabled mt-1">
                        Expires {formatDate(invitation.expires_at)}
                      </p>
                    </div>
                  </div>

                  {/* Role & Actions */}
                  <div className="flex items-center gap-4">
                    {getRoleBadge(invitation.role)}
                    
                    {currentUserRole === 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
        currentMemberCount={totalMembers}
        maxMembers={20}
      />
    </PageLayout>
  )
}

