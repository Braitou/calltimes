'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLayout, GridLayout, SectionHeader, Sidebar } from '@/components/layout'
import { ContactModal, type Contact } from '@/components/contacts/contact-modal'
import { useContacts } from '@/contexts/contacts-context'
import { useDepartments } from '@/contexts/departments-context'
import { DepartmentModal } from '@/components/contacts/department-modal'
import { toast } from 'sonner'
import Link from 'next/link'
import { Trash2, Check, Edit3, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

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


// Hook pour utiliser les départements dans les badges
function useDepartmentBadge() {
  const { getDepartmentColor } = useDepartments()
  
  const getBadgeStyle = (department: string) => {
    const color = getDepartmentColor(department)
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}50`
    }
  }
  
  return { getBadgeStyle }
}

function DepartmentBadge({ department }: { department: string }) {
  const { getBadgeStyle } = useDepartmentBadge()
  const style = getBadgeStyle(department)
  
  return (
    <span 
      className="px-2 py-1 text-xs font-medium uppercase tracking-wider rounded border"
      style={style}
    >
      {department}
    </span>
  )
}

function ContactCard({ 
  contact, 
  onEdit, 
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}: { 
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
}) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
  
  return (
    <Card className={`bg-call-times-gray-dark hover:bg-call-times-gray-medium transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ${
      isSelectionMode && isSelected 
        ? 'border-call-times-accent border-2 bg-call-times-accent/10' 
        : 'border-call-times-gray-light'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Checkbox de sélection */}
          {isSelectionMode && (
            <div className="flex items-center">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={onToggleSelection}
                className="mt-1"
              />
            </div>
          )}
          
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
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(contact)
                  }}
                  className="h-6 px-2 text-xs text-call-times-text-muted hover:text-white"
                  title="Modifier"
                >
                  ✏️
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(contact.id)
                  }}
                  className="h-6 px-2 text-xs text-call-times-text-muted hover:text-red-400"
                  title="Supprimer"
                >
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ContactRow({ 
  contact, 
  onEdit, 
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}: { 
  contact: Contact
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
}) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
  
  return (
    <div className={`border hover:bg-call-times-gray-medium transition-all duration-200 rounded-lg ${
      isSelectionMode && isSelected 
        ? 'bg-call-times-accent/10 border-call-times-accent border-2' 
        : 'bg-call-times-gray-dark border-call-times-gray-light'
    }`}>
      <div className="p-4">
        <div className={`grid gap-4 items-center text-sm ${
          isSelectionMode ? 'grid-cols-13' : 'grid-cols-12'
        }`}>
          {/* Checkbox de sélection */}
          {isSelectionMode && (
            <div className="col-span-1 flex justify-center">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={onToggleSelection}
              />
            </div>
          )}
          
          {/* Avatar + Nom */}
          <div className="col-span-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-call-times-accent text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold truncate">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-call-times-text-secondary text-xs truncate">
                {contact.role}
              </p>
            </div>
          </div>

          {/* Département */}
          <div className="col-span-2">
            <DepartmentBadge department={contact.department} />
          </div>

          {/* Email */}
          <div className="col-span-3 min-w-0">
            <p className="text-call-times-text-muted text-xs truncate">
              {contact.email}
            </p>
          </div>

          {/* Téléphone */}
          <div className="col-span-2 min-w-0">
            <p className="text-call-times-text-muted text-xs truncate">
              {contact.phone}
            </p>
          </div>

          {/* Stats */}
          <div className="col-span-1 text-center">
            <p className="text-call-times-accent font-bold text-xs">
              {contact.projectCount}
            </p>
            <p className="text-call-times-text-disabled text-xs">
              projets
            </p>
          </div>

          {/* Actions */}
          <div className="col-span-1 flex justify-end gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => {
                e.stopPropagation()
                onEdit(contact)
              }}
              className="h-7 w-7 p-0 text-xs text-call-times-text-muted hover:text-white"
              title="Modifier"
            >
              ✏️
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(contact.id)
              }}
              className="h-7 w-7 p-0 text-xs text-call-times-text-muted hover:text-red-400"
              title="Supprimer"
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  // Context global des contacts et départements
  const { contacts, addContact, updateContact, deleteContact } = useContacts()
  const { departments, addDepartment, updateDepartment, deleteDepartment, getDepartmentColor } = useDepartments()
  
  // États locaux pour l'UI
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('Tous')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  // États pour la gestion des départements
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<any>(null)

  // Filtrage et recherche
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    // Filtre par département
    if (departmentFilter !== 'Tous') {
      filtered = filtered.filter(contact => contact.department === departmentFilter)
    }

    // Recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(contact => 
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query) ||
        contact.department.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [contacts, searchQuery, departmentFilter])

  // Handlers
  const handleCreateContact = () => {
    setEditingContact(null)
    setIsModalOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setIsModalOpen(true)
  }

  const handleDeleteContact = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      deleteContact(id)
      toast.success('Contact supprimé avec succès')
    }
  }

  const handleSaveContact = (contactData: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>) => {
    if (editingContact) {
      // Modification
      updateContact(editingContact.id, contactData)
      toast.success('Contact modifié avec succès')
    } else {
      // Création
      addContact(contactData)
      toast.success('Contact créé avec succès')
    }
  }

  // Fonctions de sélection multiple
  const toggleSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedContacts(new Set(filteredContacts.map(c => c.id)))
  }

  const deselectAll = () => {
    setSelectedContacts(new Set())
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    if (isSelectionMode) {
      setSelectedContacts(new Set())
    }
  }

  const deleteSelectedContacts = () => {
    const selectedCount = selectedContacts.size
    if (selectedCount === 0) return
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedCount} contact${selectedCount > 1 ? 's' : ''} ?`)) {
      selectedContacts.forEach(id => deleteContact(id))
      setSelectedContacts(new Set())
      setIsSelectionMode(false)
      toast.success(`${selectedCount} contact${selectedCount > 1 ? 's supprimés' : ' supprimé'} avec succès`)
    }
  }

  // Fonctions de gestion des départements
  const handleAddDepartment = () => {
    setEditingDepartment(null)
    setIsDepartmentModalOpen(true)
  }

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department)
    setIsDepartmentModalOpen(true)
  }

  const handleSaveDepartment = (name: string, color: string) => {
    if (editingDepartment) {
      updateDepartment(editingDepartment.id, { name, color })
    } else {
      addDepartment(name, color)
    }
  }

  const handleDeleteDepartment = (id: string) => {
    deleteDepartment(id)
  }

  // Stats dynamiques
  const dynamicStats = [
    { label: 'Total Contacts', value: contacts.length.toString() },
    { label: 'Départements', value: new Set(contacts.map(c => c.department)).size.toString() },
    { label: 'Filtrés', value: filteredContacts.length.toString() },
  ]

  // Préparation des filtres de département avec compteurs
  const departmentFilters = useMemo(() => {
    const all = { name: 'Tous', count: contacts.length, active: departmentFilter === 'Tous', department: null }
    const deptFilters = departments.map(dept => ({
      name: dept.name,
      count: contacts.filter(c => c.department === dept.name).length,
      active: departmentFilter === dept.name,
      department: dept
    }))
    return [all, ...deptFilters]
  }, [contacts, departments, departmentFilter])

  const sidebar = (
    <Sidebar 
      title="Contact Directory"
      quickActions={quickActions}
      stats={dynamicStats}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      <SectionHeader 
        title="CONTACT DIRECTORY"
        subtitle="Votre arsenal humain pour dominer toutes les productions"
        action={
          <div className="flex gap-3">
            {isSelectionMode && selectedContacts.size > 0 && (
              <Button 
                onClick={deleteSelectedContacts}
                variant="outline"
                className="bg-transparent border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm uppercase tracking-wider"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ({selectedContacts.size})
              </Button>
            )}
            <Button 
              onClick={toggleSelectionMode}
              variant="outline"
              className={`font-bold text-sm uppercase tracking-wider ${
                isSelectionMode 
                  ? 'bg-call-times-accent text-black border-call-times-accent hover:bg-call-times-accent/80'
                  : 'bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light'
              }`}
            >
              <Check className="w-4 h-4 mr-2" />
              {isSelectionMode ? 'Terminer' : 'Sélectionner'}
            </Button>
            <Link href="/contacts/import">
              <Button 
                variant="outline" 
                className="bg-transparent border-call-times-gray-light text-white hover:bg-call-times-gray-light font-bold text-sm uppercase tracking-wider"
              >
                Import CSV
              </Button>
            </Link>
            <Button 
              onClick={handleCreateContact}
              className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-sm uppercase tracking-wider"
            >
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-call-times-gray-dark border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
          />
        </div>
        
        {/* Filtres départements avec gestion */}
        <div className="flex flex-wrap gap-3 items-center">
          {departmentFilters.map((filter) => (
            <div key={filter.name} className="relative group">
              <Button
                variant="ghost"
                onClick={() => setDepartmentFilter(filter.name)}
                className={`
                  ${filter.active 
                    ? 'text-black font-bold' 
                    : 'bg-transparent border border-call-times-gray-light text-call-times-text-muted hover:text-white hover:bg-call-times-gray-dark'
                  }
                  font-bold text-sm uppercase tracking-wider pr-8
                `}
                style={filter.active && filter.department ? { 
                  backgroundColor: filter.department.color,
                  borderColor: filter.department.color
                } : filter.active ? {
                  backgroundColor: '#4ADE80', // Couleur verte pour "Tous"
                  borderColor: '#4ADE80'
                } : undefined}
              >
                {filter.name} ({filter.count})
              </Button>
              
              {/* Icône d'édition au hover (sauf pour "Tous") */}
              {filter.department && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditDepartment(filter.department)
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-call-times-gray-dark border border-call-times-gray-light rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-call-times-accent hover:text-black flex items-center justify-center"
                  title={`Modifier ${filter.name}`}
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          
          {/* Bouton ajouter département */}
          <Button
            onClick={handleAddDepartment}
            variant="outline"
            className="border-dashed border-call-times-accent text-call-times-accent hover:bg-call-times-accent hover:text-black font-bold text-sm uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Département
          </Button>
        </div>
      </section>

      {/* Grille des contacts */}
      <section>
        <div className="mb-6 flex justify-between items-center">
          <p className="text-call-times-text-secondary">
            <span className="text-white font-bold">{filteredContacts.length}</span> contact{filteredContacts.length > 1 ? 's' : ''} 
            {searchQuery || departmentFilter !== 'Tous' ? ' trouvé' + (filteredContacts.length > 1 ? 's' : '') : ' dans votre répertoire'}
          </p>
          <div className="flex gap-2 text-sm">
            <Button 
              variant="ghost" 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold ${
                viewMode === 'list' 
                  ? 'text-call-times-accent bg-call-times-accent/10' 
                  : 'text-call-times-text-muted hover:text-white'
              }`}
              title="Vue liste"
            >
              ☰
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-bold ${
                viewMode === 'cards' 
                  ? 'text-call-times-accent bg-call-times-accent/10' 
                  : 'text-call-times-text-muted hover:text-white'
              }`}
              title="Vue cartes"
            >
              ▤
            </Button>
          </div>
        </div>

        {/* Barre d'actions de sélection multiple */}
        {isSelectionMode && (
          <div className="mb-6 p-4 bg-call-times-gray-dark border border-call-times-accent rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-call-times-accent font-bold">
                  {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} sélectionné{selectedContacts.size > 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={selectAll}
                    variant="outline"
                    className="border-call-times-accent text-call-times-accent hover:bg-call-times-accent hover:text-black"
                  >
                    Tout sélectionner ({filteredContacts.length})
                  </Button>
                  <Button 
                    size="sm"
                    onClick={deselectAll}
                    variant="outline"
                    className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-light hover:text-white"
                  >
                    Tout désélectionner
                  </Button>
                </div>
              </div>
              {selectedContacts.size > 0 && (
                <Button 
                  onClick={deleteSelectedContacts}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer la sélection
                </Button>
              )}
            </div>
          </div>
        )}

        {viewMode === 'cards' ? (
          <GridLayout cols={2} className="gap-6">
            {filteredContacts.map((contact) => (
              <ContactCard 
                key={contact.id} 
                contact={contact} 
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                isSelectionMode={isSelectionMode}
                isSelected={selectedContacts.has(contact.id)}
                onToggleSelection={() => toggleSelection(contact.id)}
              />
            ))}
          </GridLayout>
        ) : (
          <div className="space-y-3">
            {/* En-têtes de colonnes pour la vue liste */}
            <div className="bg-call-times-gray-medium/50 border border-call-times-gray-light rounded-lg">
              <div className="p-3">
                <div className={`grid gap-4 text-xs font-bold text-call-times-text-secondary uppercase tracking-wider ${
                  isSelectionMode ? 'grid-cols-13' : 'grid-cols-12'
                }`}>
                  {isSelectionMode && (
                    <div className="col-span-1 flex justify-center">
                      <Checkbox 
                        checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                        onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                      />
                    </div>
                  )}
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">Département</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Téléphone</div>
                  <div className="col-span-1 text-center">Projets</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>
              </div>
            </div>
            
            {/* Lignes de contacts */}
            {filteredContacts.map((contact) => (
              <ContactRow 
                key={contact.id}
                contact={contact} 
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                isSelectionMode={isSelectionMode}
                isSelected={selectedContacts.has(contact.id)}
                onToggleSelection={() => toggleSelection(contact.id)}
              />
            ))}
          </div>
        )}

        {/* Message si aucun résultat */}
        {filteredContacts.length === 0 && contacts.length > 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-white font-bold text-xl mb-2">Aucun contact trouvé</h3>
            <p className="text-call-times-text-secondary">
              Essayez de modifier vos critères de recherche ou filtres.
            </p>
          </div>
        )}
      </section>

      {/* Section call-to-action pour premiers contacts */}
      {contacts.length === 0 && (
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
              <Link href="/contacts/import">
                <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold text-lg uppercase tracking-wider px-8 py-4">
                  Import CSV
                </Button>
              </Link>
              <Button 
                onClick={handleCreateContact}
                variant="outline" 
                className="border-call-times-gray-light text-white hover:bg-call-times-gray-dark font-bold text-lg uppercase tracking-wider px-8 py-4"
              >
                Ajouter Contact
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Modal de gestion des départements */}
      <DepartmentModal
        open={isDepartmentModalOpen}
        onOpenChange={setIsDepartmentModalOpen}
        department={editingDepartment}
        onSave={handleSaveDepartment}
        onDelete={handleDeleteDepartment}
      />

      {/* Modal de contact */}
      <ContactModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />
    </PageLayout>
  )
}
