'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type Contact } from './contact-modal'
import { useContacts } from '@/contexts/contacts-context'

// Mock data - maintenant remplacé par le Context
/*const mockContacts: Contact[] = [
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
  }
]*/

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

function ContactSelectCard({ 
  contact, 
  onSelect,
  isSelected 
}: { 
  contact: Contact
  onSelect: (contact: Contact) => void
  isSelected: boolean
}) {
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-call-times-accent/20 border-call-times-accent' 
          : 'bg-call-times-gray-dark border-call-times-gray-light hover:bg-call-times-gray-medium'
      }`}
      onClick={() => onSelect(contact)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 bg-call-times-accent text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initials}
          </div>
          
          {/* Infos contact compactes */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-sm leading-tight truncate">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  <DepartmentBadge department={contact.department} />
                </div>
                <p className="text-call-times-text-secondary text-xs truncate">
                  {contact.role}
                </p>
              </div>
              
              {/* Indicateur de sélection */}
              {isSelected && (
                <div className="text-call-times-accent text-lg ml-2">
                  ✓
                </div>
              )}
            </div>
            
            {/* Infos contact sur une seule ligne */}
            <div className="flex items-center gap-4 mt-1">
              <p className="text-call-times-text-muted text-xs truncate flex-1">
                📧 {contact.email}
              </p>
              <p className="text-call-times-text-muted text-xs">
                📱 {contact.phone}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ContactSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectContact: (contact: Contact) => void
  title?: string
  description?: string
}

export function ContactSelectorModal({ 
  open, 
  onOpenChange, 
  onSelectContact,
  title = 'Sélectionner des contacts',
  description = 'Choisissez un ou plusieurs contacts dans votre répertoire.'
}: ContactSelectorModalProps) {
  // Utiliser le Context global des contacts
  const { contacts } = useContacts()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('Tous')
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  // Départements uniques depuis les contacts du Context
  const departments = useMemo(() => {
    const depts = Array.from(new Set(contacts.map(c => c.department)))
    return ['Tous', ...depts]
  }, [contacts])

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

  const handleSelectContact = (contact: Contact) => {
    setSelectedContacts(prev => 
      prev.find(c => c.id === contact.id)
        ? prev.filter(c => c.id !== contact.id)
        : [...prev, contact]
    )
  }

  const handleConfirmSelection = () => {
    if (selectedContacts.length > 0) {
      selectedContacts.forEach(contact => onSelectContact(contact))
      onOpenChange(false)
      setSelectedContacts([])
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSearchQuery('')
    setDepartmentFilter('Tous')
    setSelectedContacts([])
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] bg-call-times-gray-dark border-call-times-gray-light">
        <DialogHeader>
          <DialogTitle className="card-title-custom text-white text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-call-times-text-secondary">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Barre de recherche et filtres */}
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Rechercher par nom, email, téléphone, rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-call-times-gray-medium border-call-times-gray-light text-white placeholder:text-call-times-text-disabled"
            />
          </div>
          
          {/* Filtres départements */}
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <Button
                key={dept}
                variant="ghost"
                size="sm"
                onClick={() => setDepartmentFilter(dept)}
                className={`text-xs ${
                  departmentFilter === dept
                    ? 'bg-call-times-accent text-black' 
                    : 'bg-transparent border border-call-times-gray-light text-call-times-text-muted hover:text-white hover:bg-call-times-gray-medium'
                }`}
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>

        {/* Liste des contacts */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          <div className="grid grid-cols-2 gap-3">
            {filteredContacts.map((contact) => (
              <ContactSelectCard
                key={contact.id}
                contact={contact}
                onSelect={handleSelectContact}
                isSelected={selectedContacts.some(c => c.id === contact.id)}
              />
            ))}
          </div>

          {/* Message si aucun résultat */}
          {filteredContacts.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-white font-bold text-lg mb-2">Aucun contact trouvé</h3>
              <p className="text-call-times-text-secondary">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <div className="flex-1">
            {selectedContacts.length > 0 && (
              <p className="text-call-times-text-secondary text-sm">
                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-medium"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={selectedContacts.length === 0}
            className="bg-call-times-accent text-black hover:bg-call-times-accent-hover font-bold disabled:bg-call-times-gray-medium disabled:text-call-times-text-disabled"
          >
            Ajouter {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
