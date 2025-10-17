'use client'

import { useState } from 'react'
import { Download, Trash2, Plus, Maximize2, Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DesktopItem, TeamMember } from '@/types/project-hub'
import { FileThumbnail } from './FileThumbnail'
import { FilePreview } from './FilePreview'
import { getFileType, formatBytes, formatRelativeDate, getInitials } from '@/lib/utils/file-helpers'
import { cn } from '@/lib/utils'

export interface PendingInvitation {
  id: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  invited_at: string
}

interface PreviewSidebarProps {
  selectedItem: DesktopItem | null
  teamMembers: TeamMember[]
  pendingInvitations?: PendingInvitation[]
  onDownload?: (item: DesktopItem) => void
  onDelete?: (item: DesktopItem) => void
  onInviteMember?: (email: string) => void
  onOpenInviteModal?: () => void
  onRevokeInvitation?: (invitationId: string) => void
  onRemoveMember?: (memberId: string) => void
  onOpenFullscreen?: (item: DesktopItem) => void
  isReadOnly?: boolean
}

/**
 * Sidebar droite avec preview du fichier sélectionné et gestion d'équipe
 */
export function PreviewSidebar({
  selectedItem,
  teamMembers,
  pendingInvitations = [],
  onDownload,
  onDelete,
  onInviteMember,
  onOpenInviteModal,
  onRevokeInvitation,
  onRemoveMember,
  onOpenFullscreen,
  isReadOnly = false
}: PreviewSidebarProps) {

  // Extraire les infos selon le type d'item
  const getItemInfo = () => {
    if (!selectedItem) return null
    
    if (selectedItem.type === 'folder') {
      return {
        name: selectedItem.name,
        type: 'Dossier',
        size: '-',
        modified: 'created_at' in selectedItem.data ? formatRelativeDate(selectedItem.data.created_at) : '-'
      }
    }
    
    if (selectedItem.type === 'callsheet') {
      return {
        name: selectedItem.name,
        type: 'Call Sheet',
        size: '-',
        modified: 'updated_at' in selectedItem.data ? formatRelativeDate(selectedItem.data.updated_at) : '-'
      }
    }
    
    // Fichier
    if ('file_size' in selectedItem.data && 'updated_at' in selectedItem.data) {
      return {
        name: selectedItem.name,
        type: getFileType(
          'mime_type' in selectedItem.data ? selectedItem.data.mime_type : 'application/octet-stream',
          selectedItem.name
        ).toUpperCase(),
        size: formatBytes(selectedItem.data.file_size),
        modified: formatRelativeDate(selectedItem.data.updated_at)
      }
    }
    
    return null
  }

  const itemInfo = getItemInfo()

  return (
    <aside className="bg-[#0a0a0a] border-l border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4">
          Preview
        </h3>
        {selectedItem && itemInfo ? (
          <>
            <h4 className="font-bold text-base mb-1 truncate">{itemInfo.name}</h4>
            <p className="text-xs text-gray-600">{itemInfo.type}</p>
          </>
        ) : (
          <p className="text-sm text-gray-600">Aucun fichier sélectionné</p>
        )}
      </div>
      
      {/* Content scrollable */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {selectedItem && itemInfo ? (
          <>
            {/* Preview Viewer */}
            <div className="w-full aspect-[16/10] bg-gray-900 rounded-lg border border-gray-700 shadow-xl mb-6 relative overflow-hidden group">
              {selectedItem.type === 'folder' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <div className="text-yellow-600 text-6xl">📁</div>
                </div>
              ) : selectedItem.type === 'callsheet' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-green-600 text-6xl">📋</div>
                </div>
              ) : (
                // Preview fichier réel
                <>
                  <FilePreview
                    fileName={selectedItem.name}
                    mimeType={'mime_type' in selectedItem.data ? selectedItem.data.mime_type : 'application/octet-stream'}
                    fileUrl={'public_url' in selectedItem.data ? selectedItem.data.public_url : ''}
                    mode="compact"
                    className="w-full h-full"
                  />
                  {/* Bouton plein écran au survol */}
                  {onOpenFullscreen && (
                    <button
                      onClick={() => onOpenFullscreen(selectedItem)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ouvrir en plein écran"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
            
            {/* Informations */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                Informations
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-900 text-sm">
                  <span className="text-gray-600">Taille</span>
                  <span className="font-semibold">{itemInfo.size}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-900 text-sm">
                  <span className="text-gray-600">Modifié</span>
                  <span className="font-semibold">{itemInfo.modified}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold">{itemInfo.type}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2 mb-6">
              {onDownload && selectedItem.type === 'file' && (
                <Button
                  onClick={() => onDownload(selectedItem)}
                  className="w-full bg-green-400 hover:bg-green-500 text-black font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
              )}
              {onDelete && !isReadOnly && (
                <Button
                  onClick={() => onDelete(selectedItem)}
                  variant="outline"
                  className="w-full bg-red-900/20 hover:bg-red-900/30 border-red-900/50 text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 py-12">
            <p className="text-sm">Sélectionnez un fichier pour voir ses détails</p>
          </div>
        )}
        
        {/* Team Section (toujours visible) */}
        <div className="pt-6 border-t border-gray-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
            Team ({teamMembers.length})
          </h4>
          
          {/* Bouton Invite - Désactivé en lecture seule */}
          {onOpenInviteModal && !isReadOnly && (
            <Button
              onClick={onOpenInviteModal}
              className="w-full bg-green-400 hover:bg-green-500 text-black font-bold mb-4 text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Inviter un membre
            </Button>
          )}
          
          {/* Liste membres */}
          <div className="space-y-2 mb-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-[#111] border border-[#333] rounded-md p-2 flex items-center gap-3"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                  member.role === 'owner' ? 'bg-green-400 text-black' : 'bg-[#333] text-white'
                )}>
                  {member.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs truncate">{member.name}</div>
                  <div className={cn(
                    "text-[10px]",
                    member.role === 'owner' ? 'text-green-400' : 'text-gray-500'
                  )}>
                    {member.role === 'owner' ? 'Owner' : member.role === 'editor' ? 'Editor' : 'Viewer'}
                  </div>
                </div>
                {/* Bouton supprimer membre (sauf pour les owners et si pas en lecture seule) */}
                {onRemoveMember && !isReadOnly && member.role !== 'owner' && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="w-6 h-6 rounded-full bg-red-900/20 hover:bg-red-900/40 flex items-center justify-center text-red-400 transition-colors"
                    title="Retirer du projet"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Invitations en attente */}
          {pendingInvitations.length > 0 && !isReadOnly && (
            <>
              <div className="border-t border-gray-800 pt-3 mb-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Invitations en attente ({pendingInvitations.length})
                </h5>
              </div>
              <div className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="bg-[#0a0a0a] border border-yellow-900/30 rounded-md p-2 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-900/20 text-yellow-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate text-gray-300">{invitation.email}</div>
                      <div className="text-[10px] text-yellow-600">
                        {invitation.role === 'owner' ? 'Owner' : invitation.role === 'editor' ? 'Editor' : 'Viewer'} • En attente
                      </div>
                    </div>
                    {onRevokeInvitation && (
                      <button
                        onClick={() => onRevokeInvitation(invitation.id)}
                        className="w-6 h-6 rounded-full bg-red-900/20 hover:bg-red-900/40 flex items-center justify-center text-red-400 transition-colors"
                        title="Révoquer l'invitation"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

