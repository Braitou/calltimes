import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLayout, GridLayout, SectionHeader, Sidebar } from '@/components/layout'
import Link from 'next/link'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

const quickActions = [
  { icon: '👤', label: 'Nouveau Contact', href: '/contacts/new' },
  { icon: '📊', label: 'Import CSV', href: '/contacts/import' },
  { icon: '📁', label: 'Export', href: '/contacts/export' },
]

const stats = [
  { label: 'Total Contacts', value: '247' },
  { label: 'Départements', value: '12' },
  { label: 'Récents', value: '18' },
]

// Mock contacts data avec départements
const mockContacts = [
  {
    id: '1',
    firstName: 'Pierre',
    lastName: 'Lambert',
    email: 'pierre.lambert@gmail.com',
    phone: '+33 6 12 34 56 78',
    department: 'Réalisation',
    role: 'Réalisateur',
    lastUsed: '2025-09-25',
    projectCount: 8
  },
  {
    id: '2',
    firstName: 'Sophie',
    lastName: 'Moreau',
    email: 'sophie.moreau@hotmail.com',
    phone: '+33 6 23 45 67 89',
    department: 'Image',
    role: 'Directrice Photo',
    lastUsed: '2025-09-28',
    projectCount: 12
  },
  {
    id: '3',
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@gmail.com',
    phone: '+33 6 34 56 78 90',
    department: 'Son',
    role: 'Ingénieur Son',
    lastUsed: '2025-09-20',
    projectCount: 6
  },
  {
    id: '4',
    firstName: 'Julie',
    lastName: 'Petit',
    email: 'julie.petit@yahoo.fr',
    phone: '+33 6 45 67 89 01',
    department: 'Maquillage',
    role: 'Maquilleuse',
    lastUsed: '2025-09-26',
    projectCount: 15
  },
  {
    id: '5',
    firstName: 'Nicolas',
    lastName: 'Durand',
    email: 'nicolas.durand@gmail.com',
    phone: '+33 6 56 78 90 12',
    department: 'Production',
    role: 'Assistant Réalisateur',
    lastUsed: '2025-09-27',
    projectCount: 9
  },
  {
    id: '6',
    firstName: 'Emma',
    lastName: 'Roux',
    email: 'emma.roux@gmail.com',
    phone: '+33 6 67 89 01 23',
    department: 'Casting',
    role: 'Actrice Principale',
    lastUsed: '2025-09-24',
    projectCount: 4
  },
  {
    id: '7',
    firstName: 'Lucas',
    lastName: 'Blanc',
    email: 'lucas.blanc@gmail.com',
    phone: '+33 6 78 90 12 34',
    department: 'Casting',
    role: 'Acteur Principal',
    lastUsed: '2025-09-23',
    projectCount: 3
  },
  {
    id: '8',
    firstName: 'Camille',
    lastName: 'Noir',
    email: 'camille.noir@gmail.com',
    phone: '+33 6 89 01 23 45',
    department: 'Technique',
    role: 'Électricien',
    lastUsed: '2025-09-25',
    projectCount: 11
  },
  {
    id: '9',
    firstName: 'Antoine',
    lastName: 'Vert',
    email: 'antoine.vert@gmail.com',
    phone: '+33 6 90 12 34 56',
    department: 'Technique',
    role: 'Machiniste',
    lastUsed: '2025-09-22',
    projectCount: 7
  },
  {
    id: '10',
    firstName: 'Léa',
    lastName: 'Rose',
    email: 'lea.rose@gmail.com',
    phone: '+33 6 01 23 45 67',
    department: 'Coiffure',
    role: 'Coiffeuse',
    lastUsed: '2025-09-26',
    projectCount: 10
  }
]

// Départements avec compteurs
const departments = [
  { name: 'Tous', count: mockContacts.length, active: true },
  { name: 'Réalisation', count: mockContacts.filter(c => c.department === 'Réalisation').length, active: false },
  { name: 'Image', count: mockContacts.filter(c => c.department === 'Image').length, active: false },
  { name: 'Son', count: mockContacts.filter(c => c.department === 'Son').length, active: false },
  { name: 'Production', count: mockContacts.filter(c => c.department === 'Production').length, active: false },
  { name: 'Casting', count: mockContacts.filter(c => c.department === 'Casting').length, active: false },
  { name: 'Technique', count: mockContacts.filter(c => c.department === 'Technique').length, active: false },
  { name: 'Maquillage', count: mockContacts.filter(c => c.department === 'Maquillage').length, active: false },
  { name: 'Coiffure', count: mockContacts.filter(c => c.department === 'Coiffure').length, active: false },
]

function DepartmentBadge({ department }: { department: string }) {
  const colors = {
    'Réalisation': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Image': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Son': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Production': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Casting': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Technique': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Maquillage': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Coiffure': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium uppercase tracking-wider rounded border ${colors[department as keyof typeof colors] || 'bg-call-times-gray-medium text-call-times-text-muted border-call-times-gray-light'}`}>
      {department}
    </span>
  )
}

function ContactCard({ contact }: { contact: typeof mockContacts[0] }) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
  
  return (
    <Card className="bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-call-times-accent text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          
          {/* Infos contact */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-call-times-text-secondary font-medium">
                  {contact.role}
                </p>
              </div>
              <DepartmentBadge department={contact.department} />
            </div>
            
            {/* Contact details */}
            <div className="space-y-1 mb-4">
              <p className="text-call-times-text-muted text-sm">
                📧 {contact.email}
              </p>
              <p className="text-call-times-text-muted text-sm">
                📱 {contact.phone}
              </p>
            </div>
            
            {/* Stats et dernière utilisation */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex gap-4">
                <span className="text-call-times-text-disabled">
                  <span className="text-call-times-accent font-bold">{contact.projectCount}</span> projets
                </span>
                <span className="text-call-times-text-disabled">
                  Utilisé le <span className="text-white font-medium">
                    {new Date(contact.lastUsed).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short'
                    })}
                  </span>
                </span>
              </div>
              
              {/* Actions rapides */}
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-call-times-text-muted hover:text-white">
                  ✏️
                </Button>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-call-times-text-muted hover:text-call-times-accent">
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ContactsPage() {
  const sidebar = (
    <Sidebar 
      title="Contact Directory"
      quickActions={quickActions}
      stats={stats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      <SectionHeader 
        title="CONTACT DIRECTORY"
        subtitle="Votre arsenal humain pour dominer toutes les productions"
        action={
          <div className="flex gap-3">
            <Button variant="outline" className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-bold text-sm uppercase tracking-wider">
              Import CSV
            </Button>
            <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-sm uppercase tracking-wider">
              Nouveau Contact
            </Button>
          </div>
        }
      />

      {/* Barre de recherche et filtres */}
      <section className="mb-12">
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, rôle..."
            className="max-w-md bg-call-times-gray-dark border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
          />
        </div>
        
        {/* Filtres départements */}
        <div className="flex flex-wrap gap-3">
          {departments.map((dept) => (
            <Button
              key={dept.name}
              variant="ghost"
              className={`
                ${dept.active 
                  ? 'bg-call-times-accent text-black' 
                  : 'bg-transparent border border-call-times-gray-light text-call-times-text-muted hover:text-white hover:bg-call-times-gray-dark'
                }
                font-bold text-sm uppercase tracking-wider
              `}
            >
              {dept.name} ({dept.count})
            </Button>
          ))}
        </div>
      </section>

      {/* Grille des contacts */}
      <section>
        <div className="mb-6 flex justify-between items-center">
          <p className="text-call-times-text-secondary">
            <span className="text-white font-bold">{mockContacts.length}</span> contacts dans votre répertoire
          </p>
          <div className="flex gap-2 text-sm">
            <Button variant="ghost" className="text-call-times-text-muted hover:text-white px-2">
              ⋮⋮⋮
            </Button>
            <Button variant="ghost" className="text-call-times-accent hover:text-white px-2">
              ▤
            </Button>
          </div>
        </div>

        <GridLayout cols={2} className="gap-6">
          {mockContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </GridLayout>
      </section>

      {/* Section call-to-action pour premiers contacts */}
      {mockContacts.length === 0 && (
        <section className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-6">👥</div>
            <h2 className="text-white font-black text-3xl mb-6 uppercase tracking-tight">
              Construisez Votre Armée
            </h2>
            <p className="text-call-times-text-secondary text-lg mb-8 leading-relaxed">
              Importez votre équipe ou ajoutez vos premiers contacts. Un répertoire organisé est la clé 
              d&apos;une production fluide et professionnelle.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-lg uppercase tracking-wider px-8 py-4">
                Import CSV
              </Button>
              <Button variant="outline" className="border-call-times-gray-light text-white hover:bg-call-times-gray-dark font-bold text-lg uppercase tracking-wider px-8 py-4">
                Ajouter Contact
              </Button>
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  )
}
