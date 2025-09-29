import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLayout, GridLayout, SectionHeader, Sidebar } from '@/components/layout'
import Link from 'next/link'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '🚀', label: 'Nouveau Projet', href: '/projects/new' },
  { icon: '📊', label: 'Analytics', href: '/analytics' },
  { icon: '👥', label: 'Équipe', href: '/contacts' },
]

const stats = [
  { label: 'Projets Actifs', value: '12' },
  { label: 'Call Sheets', value: '34' },
  { label: 'Équipe Total', value: '247' },
]

// Mock projects data
const mockProjects = [
  {
    id: '1',
    name: 'Commercial Nike Air Max',
    description: 'Shooting commercial pour la nouvelle collection Nike Air Max. 2 jours de tournage en studio + extérieur.',
    status: 'active',
    callSheetCount: 3,
    teamCount: 12,
    nextShootDate: '2025-10-15',
    lastUpdate: '2025-09-25',
    tags: ['Commercial', 'Sport', 'Studio']
  },
  {
    id: '2',
    name: 'Shooting Mode Printemps',
    description: 'Campagne mode printemps-été 2025. Studio Harcourt + locations extérieures.',
    status: 'active',
    callSheetCount: 5,
    teamCount: 18,
    nextShootDate: '2025-10-20',
    lastUpdate: '2025-09-28',
    tags: ['Mode', 'Campagne', 'Studio']
  },
  {
    id: '3',
    name: 'Clip Musical "Lumière"',
    description: 'Clip musical pour l&apos;artiste Emma. Concept urbain avec séquences nuit.',
    status: 'draft',
    callSheetCount: 2,
    teamCount: 8,
    nextShootDate: '2025-11-05',
    lastUpdate: '2025-09-20',
    tags: ['Clip', 'Musical', 'Urbain']
  },
  {
    id: '4',
    name: 'Pub Automobile Renault',
    description: 'Commercial TV 30 secondes pour nouveau modèle Renault. Tournage route + studio.',
    status: 'active',
    callSheetCount: 4,
    teamCount: 15,
    nextShootDate: '2025-10-25',
    lastUpdate: '2025-09-26',
    tags: ['Automobile', 'Commercial', 'TV']
  },
  {
    id: '5',
    name: 'Court-métrage "Solitude"',
    description: 'Court-métrage dramatique, 15 minutes. Tournage en appartement parisien.',
    status: 'archived',
    callSheetCount: 6,
    teamCount: 10,
    nextShootDate: '',
    lastUpdate: '2025-08-15',
    tags: ['Court-métrage', 'Drame', 'Fiction']
  }
]

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-call-times-accent text-black',
    draft: 'bg-call-times-gray-light text-call-times-text-muted',
    archived: 'bg-call-times-gray-medium text-call-times-text-disabled'
  }
  
  const labels = {
    active: 'ACTIF',
    draft: 'BROUILLON',
    archived: 'ARCHIVÉ'
  }

  return (
    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${styles[status as keyof typeof styles] || styles.draft}`}>
      {labels[status as keyof typeof labels] || 'INCONNU'}
    </span>
  )
}

function ProjectCard({ project }: { project: typeof mockProjects[0] }) {
  return (
    <Card className="bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium transition-all duration-200 transform hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-call-times-gray-medium text-call-times-text-muted text-xs font-medium uppercase tracking-wider rounded">
                {tag}
              </span>
            ))}
          </div>
          <StatusBadge status={project.status} />
        </div>
        <CardTitle className="text-white font-bold text-xl mb-2 uppercase tracking-tight leading-tight">
          <Link href={`/projects/${project.id}`} className="hover:text-call-times-accent transition-colors">
            {project.name}
          </Link>
        </CardTitle>
        <p className="text-call-times-text-secondary text-sm leading-relaxed">
          {project.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Métriques */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-call-times-gray-light">
          <div className="text-center">
            <div className="text-2xl font-black text-call-times-accent mb-1">
              {project.callSheetCount}
            </div>
            <div className="text-call-times-text-disabled text-xs uppercase tracking-wider">
              Call Sheets
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-call-times-accent mb-1">
              {project.teamCount}
            </div>
            <div className="text-call-times-text-disabled text-xs uppercase tracking-wider">
              Équipe
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-call-times-accent mb-1">
{project.status === 'active' ? '⚡' : project.status === 'draft' ? '📝' : '📁'}
            </div>
            <div className="text-call-times-text-disabled text-xs uppercase tracking-wider">
              Status
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3 mb-6">
          {project.nextShootDate && (
            <div className="flex justify-between items-center">
              <span className="text-call-times-text-muted text-sm uppercase tracking-wide font-medium">
                Prochain Tournage
              </span>
              <span className="text-white font-bold">
                {new Date(project.nextShootDate).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-call-times-text-muted text-sm uppercase tracking-wide font-medium">
              Dernière MAJ
            </span>
            <span className="text-call-times-text-secondary">
              {new Date(project.lastUpdate).toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short'
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}`} className="flex-1">
            <Button className="w-full bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-sm uppercase tracking-wider">
              Manager
            </Button>
          </Link>
          <Link href={`/projects/${project.id}/call-sheets/new`}>
            <Button variant="outline" className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-medium text-sm uppercase tracking-wider">
              + Call Sheet
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  const sidebar = (
    <Sidebar 
      title="Mission Control"
      quickActions={quickActions}
      stats={stats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      <SectionHeader 
        title="MISSION CONTROL"
        subtitle="Coordonnez vos productions comme un général d&apos;armée"
        action={
          <div className="flex gap-3">
            <Button variant="outline" className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-bold text-sm uppercase tracking-wider">
              Import CSV
            </Button>
            <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-sm uppercase tracking-wider">
              Nouveau Projet
            </Button>
          </div>
        }
      />

      {/* Filtres de statut */}
      <section className="mb-12">
        <div className="flex gap-4 mb-8">
          <Button variant="ghost" className="bg-call-times-gray-dark border border-call-times-gray-light text-call-times-accent font-bold text-sm uppercase tracking-wider">
            Tous (5)
          </Button>
          <Button variant="ghost" className="bg-transparent border border-call-times-gray-light text-call-times-text-muted hover:text-white hover:bg-call-times-gray-dark font-medium text-sm uppercase tracking-wider">
            Actifs (3)
          </Button>
          <Button variant="ghost" className="bg-transparent border border-call-times-gray-light text-call-times-text-muted hover:text-white hover:bg-call-times-gray-dark font-medium text-sm uppercase tracking-wider">
            Brouillons (1)
          </Button>
          <Button variant="ghost" className="bg-transparent border border-call-times-gray-light text-call-times-text-muted hover:text-white hover:bg-call-times-gray-dark font-medium text-sm uppercase tracking-wider">
            Archivés (1)
          </Button>
        </div>
      </section>

      {/* Grille des projets */}
      <section>
        <GridLayout cols={2} className="gap-8">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </GridLayout>
      </section>

      {/* Section call-to-action pour premier projet */}
      {mockProjects.length === 0 && (
        <section className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-white font-black text-3xl mb-6 uppercase tracking-tight">
              Lancez Votre Premier Projet
            </h2>
            <p className="text-call-times-text-secondary text-lg mb-8 leading-relaxed">
              Créez votre premier projet et commencez à organiser vos productions comme un professionnel. 
              Call Times vous donne le contrôle total sur votre workflow.
            </p>
            <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-lg uppercase tracking-wider px-8 py-4">
              Créer Mon Premier Projet
            </Button>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
