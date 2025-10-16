'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, Users, Settings } from 'lucide-react'
import Link from 'next/link'

interface ProjectToolsCardProps {
  projectId: string
  stats?: {
    callSheets: number
    documents: number
    teamMembers: number
  }
}

export function ProjectToolsCard({ projectId, stats }: ProjectToolsCardProps) {
  const tools = [
    {
      icon: FileText,
      label: 'Call Sheet Editor',
      description: 'Create & edit call sheets',
      href: `/projects/${projectId}/call-sheets/new`,
      color: 'text-call-times-accent'
    },
    {
      icon: Calendar,
      label: 'Schedule',
      description: 'Manage shooting calendar',
      href: '#',
      color: 'text-blue-500',
      disabled: true
    },
    {
      icon: Users,
      label: 'Team',
      description: 'Manage project members',
      href: '#',
      color: 'text-purple-500',
      disabled: true
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 pb-4 border-b border-[#222]">
            <div className="text-center">
              <div className="text-2xl font-bold text-call-times-accent">{stats.callSheets}</div>
              <div className="text-xs text-[#a3a3a3]">Call Sheets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.documents}</div>
              <div className="text-xs text-[#a3a3a3]">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.teamMembers}</div>
              <div className="text-xs text-[#a3a3a3]">Members</div>
            </div>
          </div>
        )}

        {/* Tools List */}
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            const content = (
              <div
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-all
                  ${tool.disabled 
                    ? 'opacity-50 cursor-not-allowed bg-[#111]' 
                    : 'hover:bg-[#1a1a1a] hover:translate-x-1 cursor-pointer border border-[#222] hover:border-[#333]'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${tool.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{tool.label}</div>
                  <div className="text-xs text-[#a3a3a3]">{tool.description}</div>
                  {tool.disabled && (
                    <div className="text-xs text-[#666] mt-1">Coming soon</div>
                  )}
                </div>
              </div>
            )

            return tool.disabled ? (
              <div key={tool.label}>{content}</div>
            ) : (
              <Link key={tool.label} href={tool.href}>
                {content}
              </Link>
            )
          })}
        </div>

        {/* Project Settings */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-[#333] hover:bg-[#1a1a1a]"
        >
          <Settings className="w-4 h-4" />
          Project Settings
        </Button>
      </CardContent>
    </Card>
  )
}




