'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Mail, MoreVertical, Crown, Edit3, Eye, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TeamMember {
  id: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'pending'
  joinedAt?: string
}

interface ProjectTeamCardProps {
  projectId: string
  members: TeamMember[]
  onInviteMember?: (email: string, role: string) => Promise<void>
  onRemoveMember?: (memberId: string) => Promise<void>
}

export function ProjectTeamCard({ 
  projectId, 
  members,
  onInviteMember,
  onRemoveMember
}: ProjectTeamCardProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor')
  const [isInviting, setIsInviting] = useState(false)

  const handleInvite = async () => {
    if (!inviteEmail || !onInviteMember) return
    
    setIsInviting(true)
    try {
      await onInviteMember(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('editor')
      setIsInviteDialogOpen(false)
    } finally {
      setIsInviting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3.5 h-3.5 text-yellow-500" />
      case 'editor': return <Edit3 className="w-3.5 h-3.5 text-blue-500" />
      case 'viewer': return <Eye className="w-3.5 h-3.5 text-[#a3a3a3]" />
      default: return null
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      editor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      viewer: 'bg-[#333] text-[#a3a3a3] border-[#444]'
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[role as keyof typeof colors]}`}>
        {role}
      </span>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Team</CardTitle>
            <Button
              size="sm"
              onClick={() => setIsInviteDialogOpen(true)}
              className="gap-2 bg-call-times-accent text-black hover:bg-call-times-accent-hover"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Members Count */}
          <div className="mb-4 pb-3 border-b border-[#222]">
            <div className="text-2xl font-bold">{members.length}</div>
            <div className="text-xs text-[#a3a3a3]">
              {members.filter(m => m.status === 'active').length} active, {members.filter(m => m.status === 'pending').length} pending
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-8 text-[#666]">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No team members yet</p>
                <p className="text-xs mt-1">Invite people to collaborate</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${member.status === 'pending' 
                      ? 'border-[#222] bg-[#111] opacity-60' 
                      : 'border-[#222] hover:border-[#333] hover:bg-[#1a1a1a]'
                    }
                  `}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-call-times-accent to-green-600 flex items-center justify-center text-black font-bold flex-shrink-0">
                    {member.email[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{member.email}</span>
                      {member.status === 'pending' && (
                        <span className="text-xs text-[#666]">(pending)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getRoleIcon(member.role)}
                      <span className="text-xs text-[#a3a3a3] capitalize">{member.role}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-[#222]"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => onRemoveMember?.(member.id)}
                        >
                          Remove from project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="card-title-custom text-white text-xl">Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this project
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'editor' | 'viewer')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Editor</div>
                        <div className="text-xs text-[#a3a3a3]">Can upload, edit, and delete files</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <div>
                        <div className="font-medium">Viewer</div>
                        <div className="text-xs text-[#a3a3a3]">Can only view files</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || isInviting}
                className="flex-1 bg-call-times-accent text-black hover:bg-call-times-accent-hover"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isInviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}




