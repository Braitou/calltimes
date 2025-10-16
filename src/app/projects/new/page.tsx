'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout, SectionHeader, Sidebar } from '@/components/layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createProject } from '@/lib/services/projects'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '🚀', label: 'Tous les Projets', href: '/projects' },
  { icon: '📊', label: 'Analytics', href: '/analytics' },
  { icon: '👥', label: 'Équipe', href: '/contacts' },
]

const stats = [
  { label: 'Projets Actifs', value: '12' },
  { label: 'Call Sheets', value: '34' },
  { label: 'Équipe Total', value: '247' },
]

// Validation schema - Uniquement le nom obligatoire
const projectSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères')
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  })

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    
    try {
      // ✅ Créer le projet dans Supabase
      const result = await createProject({
        name: data.name,
        status: 'active'
      })

      if (!result.success) {
        toast.error('Erreur lors de la création du projet', {
          description: result.error || 'Une erreur est survenue'
        })
        return
      }

      console.log('✅ Projet créé dans Supabase:', result.data)
      
      toast.success('Projet créé avec succès !', {
        description: `Le projet "${data.name}" a été créé`
      })

      // Rediriger vers la page du projet
      router.push(`/projects/${result.data!.id}`)
      
    } catch (error) {
      console.error('Erreur création projet:', error)
      toast.error('Erreur lors de la création du projet')
    } finally {
      setIsLoading(false)
    }
  }

  const sidebar = (
    <Sidebar 
      title="Nouveau Projet"
      quickActions={quickActions}
      stats={stats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      <SectionHeader 
        title="NOUVEAU PROJET"
        subtitle="Créez un nouveau projet pour organiser vos productions"
        action={
          <Button 
            variant="outline" 
            onClick={() => router.push('/projects')}
            className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-bold text-sm uppercase tracking-wider"
          >
            ← Retour
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader>
            <CardTitle className="text-white font-bold text-xl uppercase tracking-tight">
              Informations du Projet
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nom du projet - UNIQUEMENT */}
              <div>
                <label className="block text-call-times-text-muted text-sm font-medium uppercase tracking-wider mb-2">
                  Nom du Projet *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Ex: Commercial Nike Air Max"
                  className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
                <p className="text-call-times-text-disabled text-xs mt-2">
                  Le projet sera créé automatiquement en mode "In Progress"
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-call-times-gray-light">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/projects')}
                  className="flex-1 bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-medium"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold uppercase tracking-wider"
                  disabled={isLoading}
                >
                  {isLoading ? 'Création...' : 'Créer le Projet'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
