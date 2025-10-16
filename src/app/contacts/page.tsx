'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PageLayout, Sidebar } from '@/components/layout'
import { ContactModal, type Contact } from '@/components/contacts/contact-modal'
import { useContacts } from '@/contexts/contacts-context'
import { useDepartments } from '@/contexts/departments-context'
import { DepartmentModal } from '@/components/contacts/department-modal'
import { toast } from 'sonner'
import Link from 'next/link'
import { Trash2, Edit3, Plus, List, LayoutGrid, Settings } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

// Mock data for development
const mockUser = {
  full_name: 'Simon Bandiera',
  email: 'simon@call-times.app'
}

// Department color mapping
const DEPARTMENT_COLORS: Record<string, { bg: string; text: string }> = {
  'Réalisation': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  'Image': { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
  'Son': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
  'Production': { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
  'Maquillage': { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899' },
  'Coiffure': { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899' },
  'Régie': { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
  'Casting': { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316' },
  'Technique': { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8' },
}

function DepartmentBadge({ department }: { department: string }) {
  const colors = DEPARTMENT_COLORS[department] || { bg: 'rgba(163, 163, 163, 0.15)', text: '#a3a3a3' }
  
  return (
    <span 
      className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md inline-block"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {department}
    </span>
  )
}

export default function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact } = useContacts()
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useDepartments()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('Tous')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<{ name: string; color: string } | null>(null)

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = searchQuery === '' || 
        contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDepartment = departmentFilter === 'Tous' || contact.department === departmentFilter
      
      return matchesSearch && matchesDepartment
    })
  }, [contacts, searchQuery, departmentFilter])

  // Department counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Tous': contacts.length }
    departments.forEach(dept => {
      counts[dept.name] = contacts.filter(c => c.department === dept.name).length
    })
    return counts
  }, [contacts, departments])

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
      toast.success('Contact supprimé')
    }
  }

  const handleSaveContact = (contact: Omit<Contact, 'id' | 'lastUsed' | 'projectCount'>) => {
    if (editingContact) {
      updateContact(editingContact.id, contact)
      toast.success('Contact mis à jour')
    } else {
      addContact(contact)
      toast.success('Contact créé')
    }
    setIsModalOpen(false)
    setEditingContact(null)
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedContacts)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedContacts(newSelection)
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedContacts.size} contacts ?`)) {
      selectedContacts.forEach(id => deleteContact(id))
      setSelectedContacts(new Set())
      setIsSelectionMode(false)
      toast.success(`${selectedContacts.size} contacts supprimés`)
    }
  }

  const handleAddDepartment = () => {
    setEditingDepartment(null)
    setIsDepartmentModalOpen(true)
  }

  const handleEditDepartment = (dept: { name: string; color: string }) => {
    setEditingDepartment(dept)
    setIsDepartmentModalOpen(true)
  }

  const sidebar = (
    <Sidebar
      title="Contact Directory"
      quickActions={[
        { icon: '📊', label: 'Import CSV/Excel', href: '/contacts/import' },
        { icon: '📤', label: 'Export', href: '/contacts/export' },
      ]}
      stats={[
        { label: 'Total Contacts', value: contacts.length.toString() },
        { label: 'Departments', value: departments.length.toString() },
        { label: 'Filtered', value: filteredContacts.length.toString() },
      ]}
    />
  )

  return (
    <PageLayout user={mockUser} sidebar={sidebar}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[2.5rem] font-black uppercase tracking-tight leading-none mb-2">
          CONTACT DIRECTORY
        </h1>
        <p className="text-base text-[#a3a3a3]">
          Your human arsenal to dominate all productions
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-8 gap-4">
        {/* Search */}
        <div className="flex-1 max-w-[500px]">
          <Input
            type="text"
            placeholder="Search by name, email, phone, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-call-times-gray-dark border-call-times-gray-light text-white placeholder:text-call-times-text-disabled py-3 px-4 rounded-lg transition-all duration-200 focus:border-call-times-accent focus:bg-[#1a1a1a]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={toggleSelectionMode}
            className="bg-[#222] text-white border border-[#333] hover:bg-[#333] hover:border-[#444] font-semibold text-sm transition-all duration-200"
          >
            {isSelectionMode ? 'Cancel Selection' : 'Select'}
          </Button>
          
          {isSelectionMode && selectedContacts.size > 0 && (
            <Button
              variant="destructive"
              onClick={deleteSelectedContacts}
              className="bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 font-semibold text-sm"
            >
              Delete ({selectedContacts.size})
            </Button>
          )}

          <Link href="/contacts/import">
            <Button
              variant="secondary"
              className="bg-[#222] text-white border border-[#333] hover:bg-[#333] hover:border-[#444] font-semibold text-sm"
            >
              Import CSV/Excel
            </Button>
          </Link>

          {/* View Toggle */}
          <div className="flex gap-1 bg-call-times-gray-dark p-1 rounded-md border border-call-times-gray-light">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-call-times-accent text-black'
                  : 'text-[#a3a3a3] hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-call-times-accent text-black'
                  : 'text-[#a3a3a3] hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleCreateContact}
            className="bg-call-times-accent text-black hover:bg-[#22c55e] font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5"
          >
            New Contact
          </Button>
        </div>
      </div>

      {/* Department Filters */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-4">
          Filter by Department
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setDepartmentFilter('Tous')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center gap-2 border ${
              departmentFilter === 'Tous'
                ? 'bg-call-times-accent text-black border-call-times-accent'
                : 'bg-call-times-gray-dark border-call-times-gray-light text-[#ccc] hover:bg-[#1a1a1a] hover:border-[#444] hover:text-white hover:-translate-y-0.5'
            }`}
          >
            <span>All</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              departmentFilter === 'Tous'
                ? 'bg-black/20 text-black'
                : 'bg-white/10 text-[#ccc]'
            }`}>
              {departmentCounts['Tous'] || 0}
            </span>
          </button>

          {departments.map((dept) => {
            const isActive = departmentFilter === dept.name
            // Convertir hex en rgba pour le fond semi-transparent
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16)
              const g = parseInt(hex.slice(3, 5), 16)
              const b = parseInt(hex.slice(5, 7), 16)
              return `rgba(${r}, ${g}, ${b}, ${alpha})`
            }
            
            return (
              <div key={dept.name} className="relative group/dept">
                <button
                  onClick={() => setDepartmentFilter(dept.name)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center gap-2 hover:-translate-y-0.5 w-full"
                  style={
                    isActive
                      ? {
                          backgroundColor: hexToRgba(dept.color, 0.15),
                          border: 'none',
                          color: dept.color,
                        }
                      : {
                          backgroundColor: 'var(--call-times-gray-dark)',
                          border: '1px solid var(--call-times-gray-light)',
                          color: '#ccc',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#1a1a1a'
                      e.currentTarget.style.borderColor = '#444'
                      e.currentTarget.style.color = '#fff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--call-times-gray-dark)'
                      e.currentTarget.style.borderColor = 'var(--call-times-gray-light)'
                      e.currentTarget.style.color = '#ccc'
                    }
                  }}
                >
                  <span>{dept.name}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: isActive ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
                      color: isActive ? dept.color : '#ccc',
                    }}
                  >
                    {departmentCounts[dept.name] || 0}
                  </span>
                </button>
                
                {/* Edit button - appears on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditDepartment({ name: dept.name, color: dept.color })
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-call-times-gray-medium border border-call-times-gray-light rounded-full flex items-center justify-center opacity-0 group-hover/dept:opacity-100 transition-opacity duration-200 hover:bg-call-times-gray-light hover:border-call-times-accent z-10"
                  title="Edit department"
                >
                  <Settings className="w-3 h-3 text-[#a3a3a3]" />
                </button>
              </div>
            )
          })}

          <button
            onClick={handleAddDepartment}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border-dashed border-call-times-accent text-call-times-accent hover:bg-call-times-accent/10 transition-all duration-200 border"
          >
            + New Department
          </button>
        </div>
      </div>

      {/* Contacts Count */}
      <div className="text-sm text-[#a3a3a3] mb-4">
        <strong className="text-white font-bold">{filteredContacts.length}</strong> contacts in your directory
      </div>

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <div className="bg-call-times-gray-dark border border-call-times-gray-light rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a3a3a3]">
              {selectedContacts.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={selectAll}
                className="bg-[#222] text-white border-[#333] hover:bg-[#333]"
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={deselectAll}
                className="bg-[#222] text-white border-[#333] hover:bg-[#333]"
              >
                Deselect All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contacts List */}
      {viewMode === 'list' ? (
        <div className="bg-call-times-gray-dark border border-call-times-gray-light rounded-xl overflow-hidden">
          {/* List Header */}
          <div className="grid grid-cols-[2fr_1.5fr_2fr_1.5fr_1fr_100px] gap-4 px-6 py-4 bg-[#0a0a0a] border-b border-[#222] text-xs font-semibold text-[#666] uppercase tracking-wider">
            <div>Contact</div>
            <div>Department</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Projects</div>
            <div>Actions</div>
          </div>

          {/* Contact Rows */}
          {filteredContacts.map((contact) => {
            const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
            const isSelected = selectedContacts.has(contact.id)

            return (
              <div
                key={contact.id}
                className="grid grid-cols-[2fr_1.5fr_2fr_1.5fr_1fr_100px] gap-4 px-6 py-5 border-b border-[#222] last:border-b-0 items-center transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer relative group hover:bg-[#1a1a1a] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-transparent before:transition-all before:duration-200 hover:before:bg-call-times-accent"
              >
                {/* Contact Info */}
                <div className="flex items-center gap-4">
                  {isSelectionMode && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(contact.id)}
                    />
                  )}
                  <div className="w-10 h-10 rounded-full bg-call-times-accent text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-[0.95rem] mb-0.5">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <div className="text-[#a3a3a3] text-[0.85rem]">
                      {contact.role}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <DepartmentBadge department={contact.department} />
                </div>

                {/* Email */}
                <div className="text-[#a3a3a3] text-sm">
                  {contact.email}
                </div>

                {/* Phone */}
                <div className="text-[#a3a3a3] text-sm">
                  {contact.phone}
                </div>

                {/* Projects */}
                <div className="text-call-times-accent font-semibold text-sm">
                  0 projects
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="w-8 h-8 flex items-center justify-center bg-[#222] border border-[#333] rounded-md text-[#a3a3a3] hover:bg-[#333] hover:text-white hover:border-[#444] transition-all duration-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="w-8 h-8 flex items-center justify-center bg-[#222] border border-[#333] rounded-md text-[#a3a3a3] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}

          {filteredContacts.length === 0 && (
            <div className="py-12 text-center text-[#a3a3a3]">
              No contacts found
            </div>
          )}
        </div>
      ) : (
        // Cards View (existing implementation)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => {
            const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
            const isSelected = selectedContacts.has(contact.id)

            return (
              <Card
                key={contact.id}
                className={`bg-call-times-gray-dark hover:bg-call-times-gray-medium transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ${
                  isSelectionMode && isSelected
                    ? 'border-call-times-accent border-2 bg-call-times-accent/10'
                    : 'border-call-times-gray-light'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {isSelectionMode && (
                      <div className="flex items-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(contact.id)}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div className="w-12 h-12 bg-call-times-accent text-black rounded-full flex items-center justify-center font-bold text-base flex-shrink-0">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-base leading-tight truncate mb-1">
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <DepartmentBadge department={contact.department} />
                        </div>
                      </div>

                      <p className="text-call-times-text-secondary text-sm mb-3 truncate">
                        {contact.role}
                      </p>

                      <div className="space-y-2 text-sm">
                        <p className="text-call-times-text-muted truncate">
                          📧 {contact.email}
                        </p>
                        <p className="text-call-times-text-muted">
                          📱 {contact.phone}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-call-times-gray-light">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditContact(contact)}
                          className="flex-1 bg-call-times-gray-medium hover:bg-call-times-gray-light text-white text-xs"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredContacts.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#a3a3a3]">
              No contacts found
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ContactModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingContact(null)
        }}
        onSave={handleSaveContact}
        contact={editingContact}
      />

      <DepartmentModal
        open={isDepartmentModalOpen}
        onOpenChange={(open) => {
          setIsDepartmentModalOpen(open)
          if (!open) setEditingDepartment(null)
        }}
        onSave={(name, color) => {
          if (editingDepartment) {
            // Find department ID by name to update
            const existingDept = departments.find(d => d.name === editingDepartment.name)
            if (existingDept) {
              updateDepartment(existingDept.id, { name, color })
              toast.success('Department updated')
            }
          } else {
            addDepartment(name, color)
            toast.success('Department created')
          }
          setIsDepartmentModalOpen(false)
          setEditingDepartment(null)
        }}
        onDelete={(id) => {
          deleteDepartment(id)
          toast.success('Department deleted')
          setIsDepartmentModalOpen(false)
          setEditingDepartment(null)
        }}
        department={editingDepartment ? {
          id: departments.find(d => d.name === editingDepartment.name)?.id || '',
          name: editingDepartment.name,
          color: editingDepartment.color,
          isDefault: departments.find(d => d.name === editingDepartment.name)?.isDefault || false
        } : null}
      />
    </PageLayout>
  )
}
