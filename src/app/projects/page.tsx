'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLayout, Sidebar } from '@/components/layout'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getProjects, deleteProjects, updateProject } from '@/lib/services/projects'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '🚀', label: 'New Project', href: '/projects/new' },
  { icon: '📊', label: 'Analytics', href: '/analytics' },
  { icon: '👥', label: 'Team', href: '/contacts' },
]

const stats = [
  { label: 'Active Projects', value: '12' },
  { label: 'Call Sheets', value: '34' },
  { label: 'Total Team', value: '247' },
]

// Mock projects data - simplified
type ProjectStatus = 'active' | 'draft' | 'archived'
type ProjectProgress = 'in_progress' | 'over'

interface Project {
  id: string
  name: string
  status: ProjectStatus
  progress: ProjectProgress
  documents: number
  callSheets: number
  size: string
  tags: string[]
}

// Aucun projet par défaut - liste vide
const mockProjectsData: Project[] = []

function StatusBadge({ status }: { status: ProjectStatus }) {
  const styles = {
    active: 'bg-[rgba(74,222,128,0.15)] text-call-times-accent',
    draft: 'bg-[rgba(100,116,139,0.15)] text-[#94a3b8]',
    archived: 'bg-[rgba(71,85,105,0.15)] text-[#64748b]'
  }
  
  const labels = {
    active: 'ACTIVE',
    draft: 'DRAFT',
    archived: 'ARCHIVED'
  }

  return (
    <span className={`px-3 py-1.5 rounded-md text-[0.7rem] font-bold uppercase tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function ProgressBadge({ progress, onChange }: { progress: ProjectProgress, onChange: (newProgress: ProjectProgress) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          className={`px-3 py-1.5 rounded-md text-[0.7rem] font-bold uppercase tracking-wider transition-all duration-200 border flex items-center gap-1.5 ${
            progress === 'in_progress'
              ? 'bg-[rgba(34,197,94,0.15)] text-[#22c55e] border-[#22c55e]/30 hover:bg-[rgba(34,197,94,0.25)]'
              : 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[#ef4444]/30 hover:bg-[rgba(239,68,68,0.25)]'
          }`}
        >
          {progress === 'in_progress' ? 'IN PROGRESS' : 'OVER'}
          <ChevronDown className="w-3 h-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="bg-call-times-gray-dark border-call-times-gray-light min-w-[160px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange('in_progress')
          }}
          className="text-white hover:bg-call-times-gray-medium focus:bg-call-times-gray-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span>In Progress</span>
            {progress === 'in_progress' && <span className="ml-auto text-call-times-accent">✓</span>}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange('over')
          }}
          className="text-white hover:bg-call-times-gray-medium focus:bg-call-times-gray-medium cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Over</span>
            {progress === 'over' && <span className="ml-auto text-call-times-accent">✓</span>}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProjectCard({ 
  project, 
  index,
  isSelected,
  onToggleSelection,
  onToggleProgress
}: { 
  project: Project
  index: number
  isSelected: boolean
  onToggleSelection: (id: string) => void
  onToggleProgress: (id: string, newProgress: ProjectProgress) => void
}) {
  return (
    <Card 
      className={`relative bg-[#111] border-[#333] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden hover:bg-[#1a1a1a] hover:border-[#444] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-call-times-accent before:scale-y-0 before:transition-transform before:duration-300 before:ease-out hover:before:scale-y-100 animate-[fadeInUp_0.4s_ease-out_backwards] ${
        isSelected ? 'border-call-times-accent border-2 bg-call-times-accent/10' : ''
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <CardContent className="p-5 pb-4 relative z-10">
        {/* Checkbox always visible */}
        <div className="absolute top-4 left-4 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(project.id)}
          />
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-[1.125rem] mb-3 leading-tight ml-8">
          <Link 
            href={`/projects/${project.id}`} 
            className="hover:text-call-times-accent transition-colors duration-200"
          >
            {project.name}
          </Link>
        </h3>

        {/* Progress Status */}
        <div className="mb-3">
          <ProgressBadge 
            progress={project.progress} 
            onChange={(newProgress) => onToggleProgress(project.id, newProgress)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#222]">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {project.documents}
            </div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#666] font-medium">
              Documents
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {project.callSheets}
            </div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#666] font-medium">
              Call Sheets
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {project.size}
            </div>
            <div className="text-[0.7rem] uppercase tracking-wider text-[#666] font-medium">
              Size
            </div>
          </div>
        </div>

        {/* Actions (appear on hover) */}
        <div className="mt-3 pt-3 border-t border-[#222] flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <Button className="w-full bg-call-times-accent text-black hover:bg-[#22c55e] font-semibold text-sm border-call-times-accent transition-all duration-200 h-9">
              Open
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="flex-1 bg-[#222] border-[#333] text-[#a3a3a3] hover:bg-[#333] hover:text-white font-semibold text-sm transition-all duration-200 h-9"
          >
            Options
          </Button>
        </div>
      </CardContent>

      {/* Inline animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  )
}

export default function ProjectsPage() {
  // ✅ Charger les projets depuis Supabase
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Charger les projets au montage
  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const result = await getProjects()
      if (result.success) {
        // Mapper les données Supabase vers le format local
        const mappedProjects = result.data.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          progress: 'in_progress' as const, // Valeur par défaut
          documents: 0,
          callSheets: 0,
          size: '0MB',
          tags: []
        }))
        setProjects(mappedProjects)
      } else {
        console.error('Error loading projects:', result.error)
        toast.error('Erreur lors du chargement des projets')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Erreur lors du chargement des projets')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedProjects)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedProjects(newSelection)
  }

  const selectAll = () => {
    setSelectedProjects(new Set(projects.map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedProjects(new Set())
  }

  const deleteSelectedProjects = async () => {
    if (confirm(`Are you sure you want to delete ${selectedProjects.size} project(s)?`)) {
      try {
        // ✅ Supprimer dans Supabase
        const result = await deleteProjects(Array.from(selectedProjects))
        
        if (result.success) {
          // Recharger la liste
          await loadProjects()
          setSelectedProjects(new Set())
          toast.success(`${selectedProjects.size} project(s) deleted`)
        } else {
          toast.error('Erreur lors de la suppression', {
            description: result.error
          })
        }
      } catch (error) {
        console.error('Error deleting projects:', error)
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const toggleProjectProgress = async (id: string, newProgress: ProjectProgress) => {
    try {
      // Optimistic update
      const newProjects = projects.map(p => 
        p.id === id 
          ? { ...p, progress: newProgress }
          : p
      )
      setProjects(newProjects)
      
      // Note: Pour l'instant on garde juste l'update local
      // car la table projects n'a pas de colonne "progress"
      // On pourrait ajouter un champ metadata ou status personnalisé
      
      toast.success(`Project status changed to "${newProgress === 'in_progress' ? 'In Progress' : 'Over'}"`)
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Erreur lors de la mise à jour')
      // Recharger en cas d'erreur
      await loadProjects()
    }
  }

  const sidebar = (
    <Sidebar 
      title="Mission Control"
      quickActions={quickActions}
      stats={stats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="page-title text-[3rem] mb-3">
          Mission Control
        </h1>
        <p className="section-header text-sm">
          COORDINATE YOUR PRODUCTIONS WITH ELEGANCE
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end items-center mb-8">
        {/* Actions */}
        <div className="flex gap-3">
          {selectedProjects.size > 0 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={selectAll}
                className="bg-[#222] text-white border border-[#333] hover:bg-[#333] hover:border-[#444] font-semibold text-sm"
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={deselectAll}
                className="bg-[#222] text-white border border-[#333] hover:bg-[#333] hover:border-[#444] font-semibold text-sm"
              >
                Deselect All
              </Button>
              <Button
                variant="destructive"
                onClick={deleteSelectedProjects}
                className="bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 font-semibold text-sm"
              >
                Delete ({selectedProjects.size})
              </Button>
            </>
          )}

          <Link href="/projects/new">
            <Button className="bg-call-times-accent text-black hover:bg-[#22c55e] font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5">
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Selection Info */}
      {selectedProjects.size > 0 && (
        <div className="bg-call-times-gray-dark border border-call-times-gray-light rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a3a3a3]">
              {selectedProjects.size} project(s) selected
            </span>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <section>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index}
              isSelected={selectedProjects.has(project.id)}
              onToggleSelection={toggleSelection}
              onToggleProgress={toggleProjectProgress}
            />
          ))}
        </div>
      </section>

      {/* Empty state */}
      {projects.length === 0 && (
        <section className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="page-title text-[2.5rem] mb-4">
              Launch Your First Project
            </h2>
            <p className="section-header text-sm mb-6">
              START SOMETHING AMAZING
            </p>
            <p className="text-[#a3a3a3] text-base mb-8 leading-relaxed">
              Create your first project and start organizing your productions like a professional. 
              Call Times gives you total control over your workflow.
            </p>
            <Link href="/projects/new">
              <Button className="bg-call-times-accent text-black hover:bg-[#22c55e] font-bold text-lg uppercase tracking-wider px-8 py-6 transition-all duration-200 hover:-translate-y-1">
                Create My First Project
              </Button>
            </Link>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
