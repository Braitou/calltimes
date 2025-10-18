'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout, SectionHeader } from '@/components/layout'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createProject } from '@/lib/services/projects'
import { listOrganizationMembers } from '@/lib/services/organization-invitations'
import { inviteProjectMember } from '@/lib/services/invitations'
import { Users, Mail, X } from 'lucide-react'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

// Validation schema - Uniquement le nom obligatoire
const projectSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères')
})

type ProjectFormData = z.infer<typeof projectSchema>

interface OrganizationMember {
  id: string
  full_name: string | null
  email: string
  role: 'owner' | 'member'
}

export default function NewProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [orgMembers, setOrgMembers] = useState<OrganizationMember[]>([])
  const [guestEmails, setGuestEmails] = useState<string[]>([])
  const [guestEmailInput, setGuestEmailInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  })

  // Charger les membres de l'organisation
  useEffect(() => {
    loadOrganizationMembers()
  }, [])

  const loadOrganizationMembers = async () => {
    try {
      const result = await listOrganizationMembers()
      if (result.success && result.data) {
        setOrgMembers(result.data.members || [])
      }
    } catch (error) {
      console.error('Error loading org members:', error)
    }
  }

  const addGuestEmail = () => {
    const email = guestEmailInput.trim().toLowerCase()
    if (!email) return

    // Validation email simple
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Email invalide')
      return
    }

    // Vérifier si déjà ajouté
    if (guestEmails.includes(email)) {
      toast.error('Cet email est déjà dans la liste')
      return
    }

    // Vérifier si c'est un membre de l'org
    if (orgMembers.some(m => m.email.toLowerCase() === email)) {
      toast.error('Ce membre fait déjà partie de l\'organisation')
      return
    }

    setGuestEmails([...guestEmails, email])
    setGuestEmailInput('')
  }

  const removeGuestEmail = (email: string) => {
    setGuestEmails(guestEmails.filter(e => e !== email))
  }

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
      const projectId = result.data!.id

      // ✅ Inviter les guests si des emails ont été ajoutés
      if (guestEmails.length > 0) {
        toast.info(`Envoi des invitations à ${guestEmails.length} guest(s)...`)
        
        for (const email of guestEmails) {
          try {
            await inviteProjectMember(projectId, email, 'viewer')
          } catch (error) {
            console.error(`Erreur invitation ${email}:`, error)
          }
        }
        
        toast.success('Invitations envoyées !', {
          description: `${guestEmails.length} invitation(s) guest envoyée(s)`
        })
      }
      
      toast.success('Projet créé avec succès !', {
        description: `Le projet "${data.name}" a été créé`
      })

      // Rediriger vers la page du projet
      router.push(`/projects/${projectId}`)
      
    } catch (error) {
      console.error('Erreur création projet:', error)
      toast.error('Erreur lors de la création du projet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout user={mockUser}>
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

      <div className="max-w-4xl mx-auto">
        <Card className="bg-call-times-gray-dark border-call-times-gray-light">
          <CardHeader>
            <CardTitle className="text-white font-bold text-2xl uppercase tracking-tight">
              Créer un Nouveau Projet
            </CardTitle>
            <p className="text-call-times-text-disabled text-sm mt-2">
              Configurez votre projet et gérez les accès
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Informations du Projet */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4 pb-2 border-b border-[#333]">
                  Informations du Projet
                </h3>
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
              </div>

              {/* Section 2: Membres de l'Organisation */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#333]">
                  <Users className="w-5 h-5 text-call-times-accent" />
                  <h3 className="text-white font-bold text-lg">
                    Membres de l'Organisation
                  </h3>
                </div>
                <p className="text-call-times-text-disabled text-sm mb-4">
                  Ces membres auront automatiquement accès au projet
                </p>
                {orgMembers.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Chargement des membres...</p>
                ) : (
                  <div className="space-y-2">
                    {orgMembers.map((member) => (
                      <div
                        key={member.id}
                        className="bg-[#111] border border-[#333] rounded-md p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-call-times-accent rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">
                              {member.full_name || member.email}
                            </div>
                            <div className="text-gray-500 text-xs">{member.email}</div>
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs font-semibold uppercase">
                          {member.role}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Inviter des Guests */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#333]">
                  <Mail className="w-5 h-5 text-green-400" />
                  <h3 className="text-white font-bold text-lg">
                    Inviter des Guests (Optionnel)
                  </h3>
                </div>
                <p className="text-call-times-text-disabled text-sm mb-4">
                  Invitez des personnes externes en lecture seule
                </p>
                
                {/* Input pour ajouter un guest */}
                <div className="flex gap-2 mb-4">
                  <Input
                    type="email"
                    placeholder="email@exemple.com"
                    value={guestEmailInput}
                    onChange={(e) => setGuestEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addGuestEmail()
                      }
                    }}
                    className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
                  />
                  <Button
                    type="button"
                    onClick={addGuestEmail}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                  >
                    Ajouter
                  </Button>
                </div>

                {/* Liste des guests ajoutés */}
                {guestEmails.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">
                      {guestEmails.length} guest(s) seront invité(s) :
                    </p>
                    {guestEmails.map((email) => (
                      <div
                        key={email}
                        className="bg-[#0a0a0a] border border-green-900/30 rounded-md p-2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">{email}</span>
                          <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-semibold uppercase">
                            Viewer
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeGuestEmail(email)}
                          className="w-6 h-6 rounded-full bg-red-900/20 hover:bg-red-900/40 flex items-center justify-center text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
