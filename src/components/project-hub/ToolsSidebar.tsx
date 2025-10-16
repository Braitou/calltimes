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
  onNewFolder
}: ToolsSidebarProps) {
  
  const tools: ToolItem[] = [
    {
      icon: FileText,
      label: 'Edit Call Sheet',
      description: 'Create new sheet',
      color: 'green',
      onClick: onNewCallSheet
    },
    {
      icon: Users,
      label: 'Crew List',
      description: 'Manage team',
      color: 'blue',
      onClick: onManageTeam
    },
    {
      icon: UserPlus,
      label: 'Add Contacts',
      description: 'Import people',
      color: 'purple',
      onClick: onAddContacts
    },
    {
      icon: Mail,
      label: 'Send Email',
      description: 'Notify team',
      color: 'red',
      onClick: onSendEmail
    },
    {
      icon: Upload,
      label: 'Import Docs',
      description: 'Upload files',
      color: 'orange',
      onClick: onUploadFiles
    },
    {
      icon: FolderPlus,
      label: 'New Folder',
      description: 'Organize files',
      color: 'yellow',
      onClick: onNewFolder
    },
  ]

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
      </div>
    </aside>
  )
}

