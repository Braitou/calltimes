'use client'

import { FileText, Users, UserPlus, Mail, Upload, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToolItem, ToolColor } from '@/types/project-hub'

interface ToolsSidebarProps {
  projectId: string
  projectName: string
  projectStats: {
    filesCount: number
    totalSize: string
    membersCount: number
  }
  onNewCallSheet: () => void
  onManageTeam: () => void
  onAddContacts: () => void
  onSendEmail: () => void
  onUploadFiles: () => void
  onNewFolder: () => void
  isReadOnly?: boolean
  role?: 'owner' | 'editor' | 'viewer' | null
}

const colorClasses: Record<ToolColor, string> = {
  green: 'text-green-400',
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  red: 'text-red-500',
  orange: 'text-orange-500',
  yellow: 'text-yellow-500',
}

/**
 * Sidebar gauche avec les actions rapides (Tools)
 */
export function ToolsSidebar({
  projectId,
  projectName,
  projectStats,
  onNewCallSheet,
  onManageTeam,
  onAddContacts,
  onSendEmail,
  onUploadFiles,
  onNewFolder,
  isReadOnly = false,
  role = null
}: ToolsSidebarProps) {
  
  // Permissions par rôle
  const canManageCallSheets = role === 'owner' // Seulement owners
  const canUpload = role === 'owner' || role === 'editor' // Owners et editors
  const canCreateFolder = role === 'owner' || role === 'editor' // Owners et editors
  const canManageTeam = role === 'owner' // Seulement owners
  
  // Filtrer les outils selon les permissions
  const allTools: ToolItem[] = [
    {
      icon: FileText,
      label: 'Edit Call Sheet',
      description: 'Create new sheet',
      color: 'green',
      onClick: onNewCallSheet,
      disabled: !canManageCallSheets
    },
    {
      icon: Users,
      label: 'Crew List',
      description: 'Manage team',
      color: 'blue',
      onClick: onManageTeam,
      disabled: !canManageTeam
    },
    {
      icon: UserPlus,
      label: 'Add Contacts',
      description: 'Import people',
      color: 'purple',
      onClick: onAddContacts,
      disabled: !canManageTeam
    },
    {
      icon: Mail,
      label: 'Send Email',
      description: 'Notify team',
      color: 'red',
      onClick: onSendEmail,
      disabled: !canManageTeam
    },
    {
      icon: Upload,
      label: 'Import Docs',
      description: 'Upload files',
      color: 'orange',
      onClick: onUploadFiles,
      disabled: !canUpload
    },
    {
      icon: FolderPlus,
      label: 'New Folder',
      description: 'Organize files',
      color: 'yellow',
      onClick: onNewFolder,
      disabled: !canCreateFolder
    },
  ]
  
  // Masquer complètement les outils en mode lecture seule
  const tools = isReadOnly ? [] : allTools

  return (
    <aside className="bg-[#0a0a0a] border-r border-gray-800 flex flex-col overflow-hidden">
      {/* Header avec infos projet */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-lg font-bold mb-1 truncate">{projectName}</h2>
        <p className="text-xs text-gray-600">
          {projectStats.filesCount} documents • {projectStats.totalSize} • {projectStats.membersCount} membre{projectStats.membersCount > 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Section Tools */}
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-4">
          Tools
        </h3>
        
        {isReadOnly ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              Read-only access
            </p>
            <p className="text-gray-600 text-xs mt-2">
              You can view and download files
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tools.map((tool, index) => {
              const Icon = tool.icon
              return (
                <button
                  key={index}
                  onClick={tool.onClick}
                  className={cn(
                    "w-full bg-[#111] hover:bg-[#222] border border-[#333] rounded-lg p-4",
                    "flex items-center gap-4 transition-all group relative",
                    "hover:translate-x-0.5"
                  )}
                >
                  {/* Border-left accent on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Icon colorée sur fond gris */}
                  <div className="w-10 h-10 bg-[#222] rounded-md flex items-center justify-center flex-shrink-0">
                    <Icon className={cn("w-5 h-5", colorClasses[tool.color])} />
                  </div>
                  
                  {/* Texte */}
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{tool.label}</div>
                    <div className="text-xs text-gray-600 truncate">{tool.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}

