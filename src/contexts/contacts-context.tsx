'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { toast } from 'sonner'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  role: string
  lastUsed: string
  projectCount: number
}

// Données initiales (même que dans contacts/page.tsx)
const initialContacts: Contact[] = [
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

interface ContactsContextType {
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>) => void
  updateContact: (id: string, updates: Partial<Contact>) => void
  deleteContact: (id: string) => void
  addMultipleContacts: (contacts: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>[]) => void
  getContactByEmail: (email: string) => Contact | undefined
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)

  const addContact = (contactData: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `contact-${Date.now()}-${Math.random()}`,
      lastUsed: new Date().toISOString().split('T')[0],
      projectCount: 0
    }
    setContacts(prev => [...prev, newContact])
    return newContact
  }

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ))
  }

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id))
  }

  const addMultipleContacts = (contactsData: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>[]) => {
    const newContacts: Contact[] = contactsData.map((contactData, index) => ({
      ...contactData,
      id: `import-${Date.now()}-${index}`,
      lastUsed: new Date().toISOString().split('T')[0],
      projectCount: 0
    }))
    
    setContacts(prev => [...prev, ...newContacts])
    return newContacts
  }

  const getContactByEmail = (email: string) => {
    return contacts.find(contact => contact.email.toLowerCase() === email.toLowerCase())
  }

  return (
    <ContactsContext.Provider value={{
      contacts,
      addContact,
      updateContact,
      deleteContact,
      addMultipleContacts,
      getContactByEmail
    }}>
      {children}
    </ContactsContext.Provider>
  )
}

export function useContacts() {
  const context = useContext(ContactsContext)
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider')
  }
  return context
}
