'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

// Mock data pour le développement
const mockCallSheet = {
  id: '1',
  title: 'Call Sheet (25 septembre 2025)',
  date: '2025-09-25',
  project_name: 'Commercial Nike',
  locations: [
    {
      id: 1,
      name: 'Studio Harcourt',
      address: '6 Rue de Lota, 75016 Paris',
      notes: 'Accès par la cour intérieure'
    }
  ],
  important_contacts: [
    {
      id: 1,
      name: 'Jean Dupont',
      role: 'Producteur',
      phone: '+33 6 11 22 33 44',
      email: 'jean.dupont@prod.fr'
    }
  ],
  logo_url: null,
  notes: 'Tournage en studio avec équipe réduite',
  schedule: [
    { id: 1, title: 'Call time — Production', time: '08:00' },
    { id: 2, title: 'Start shooting', time: '09:30' },
    { id: 3, title: 'Lunch', time: '13:00' },
    { id: 4, title: 'Wrap', time: '18:00' }
  ],
  team: [
    {
      id: 1,
      name: 'Simon Bandiera',
      role: 'régisseur',
      department: 'Production',
      phone: '+33 6 12 34 56 78',
      email: 'bandiera.simon@gmail.com'
    }
  ]
}

type Section = 'informations' | 'planning' | 'equipe' | 'parametres'

interface EditorSidebarProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
  callSheet: typeof mockCallSheet
  onUpdateCallSheet: (updates: Partial<typeof mockCallSheet>) => void
  onUpdateScheduleItem: (index: number, updates: Partial<typeof mockCallSheet.schedule[0]>) => void
  onAddLocation: () => void
  onUpdateLocation: (index: number, updates: Partial<typeof mockCallSheet.locations[0]>) => void
  onRemoveLocation: (index: number) => void
  onAddImportantContact: () => void
  onUpdateImportantContact: (index: number, updates: Partial<typeof mockCallSheet.important_contacts[0]>) => void
  onRemoveImportantContact: (index: number) => void
  onAddTeamMember: () => void
  onUpdateTeamMember: (index: number, updates: Partial<typeof mockCallSheet.team[0]>) => void
  onRemoveTeamMember: (index: number) => void
}

function EditorSidebar({ 
  activeSection, 
  onSectionChange, 
  callSheet, 
  onUpdateCallSheet, 
  onUpdateScheduleItem,
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation,
  onAddImportantContact,
  onUpdateImportantContact,
  onRemoveImportantContact,
  onAddTeamMember,
  onUpdateTeamMember,
  onRemoveTeamMember
}: EditorSidebarProps) {
  const sections = [
    { id: 'informations' as Section, label: 'Informations', color: 'blue' },
    { id: 'planning' as Section, label: 'Planning', color: 'red' },
    { id: 'equipe' as Section, label: 'Équipe', color: 'green' },
    { id: 'parametres' as Section, label: 'Paramètres', color: 'orange' }
  ]

  return (
    <div className="w-[350px] bg-call-times-gray-dark border-r border-call-times-gray-light flex flex-col">
      {/* Toolbar Sections avec codes couleurs */}
      <nav className="grid grid-cols-2 gap-2 p-4 border-b border-call-times-gray-light">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-lg font-bold text-xs uppercase tracking-wider
              transition-all duration-200 border-2
              ${activeSection === section.id 
                ? `${getSectionActiveStyles(section.color)} text-white` 
                : 'bg-call-times-gray-medium border-transparent text-call-times-text-muted hover:bg-call-times-gray-light hover:text-white'
              }
            `}
          >
            <div className={`w-4 h-4 rounded-full ${getSectionIconColor(section.color)}`} />
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      {/* Section Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'informations' && (
          <InformationsSection 
            callSheet={callSheet} 
            onUpdate={onUpdateCallSheet}
            onAddLocation={onAddLocation}
            onUpdateLocation={onUpdateLocation}
            onRemoveLocation={onRemoveLocation}
            onAddImportantContact={onAddImportantContact}
            onUpdateImportantContact={onUpdateImportantContact}
            onRemoveImportantContact={onRemoveImportantContact}
          />
        )}
        {activeSection === 'planning' && (
          <PlanningSection 
            callSheet={callSheet}
            onUpdate={onUpdateCallSheet}
            onUpdateScheduleItem={onUpdateScheduleItem}
          />
        )}
        {activeSection === 'equipe' && (
          <EquipeSection 
            callSheet={callSheet}
            onAddTeamMember={onAddTeamMember}
            onUpdateTeamMember={onUpdateTeamMember}
            onRemoveTeamMember={onRemoveTeamMember}
          />
        )}
        {activeSection === 'parametres' && <ParametresSection />}
      </div>
    </div>
  )
}

function getSectionActiveStyles(color: string) {
  const styles = {
    blue: 'bg-blue-800 border-blue-500',
    red: 'bg-red-800 border-red-500', 
    green: 'bg-green-800 border-green-500',
    orange: 'bg-orange-800 border-orange-500'
  }
  return styles[color as keyof typeof styles]
}

function getSectionIconColor(color: string) {
  const styles = {
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    green: 'bg-green-500', 
    orange: 'bg-orange-500'
  }
  return styles[color as keyof typeof styles]
}

function InformationsSection({ 
  callSheet, 
  onUpdate,
  onAddLocation,
  onUpdateLocation,
  onRemoveLocation,
  onAddImportantContact,
  onUpdateImportantContact,
  onRemoveImportantContact
}: { 
  callSheet: typeof mockCallSheet
  onUpdate: (updates: Partial<typeof mockCallSheet>) => void
  onAddLocation: () => void
  onUpdateLocation: (index: number, updates: Partial<typeof mockCallSheet.locations[0]>) => void
  onRemoveLocation: (index: number) => void
  onAddImportantContact: () => void
  onUpdateImportantContact: (index: number, updates: Partial<typeof mockCallSheet.important_contacts[0]>) => void
  onRemoveImportantContact: (index: number) => void
}) {
  return (
    <div>
      <div className="mb-6 pb-3 border-b-2 border-blue-500">
        <h3 className="text-blue-500 font-semibold text-sm uppercase tracking-wider">
          INFORMATIONS GÉNÉRALES
        </h3>
      </div>
      
      <div className="space-y-6">
        {/* Titre */}
        <div>
          <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
            Titre du Call Sheet *
          </label>
          <input
            type="text"
            value={callSheet.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-3 text-white focus:border-call-times-accent focus:bg-call-times-gray-light outline-none transition-all"
          />
        </div>
        
        {/* Date */}
        <div>
          <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
            Date
          </label>
          <input
            type="date"
            value={callSheet.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-3 text-white focus:border-call-times-accent focus:bg-call-times-gray-light outline-none transition-all"
          />
        </div>
        
        {/* Locations */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider">
              Lieux de tournage
            </label>
            <Button
              onClick={onAddLocation}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              + Ajouter lieu
            </Button>
          </div>
          
          <div className="space-y-3">
            {callSheet.locations.map((location, index) => (
              <div key={location.id} className="bg-call-times-gray-light border border-call-times-gray-medium rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-medium text-sm">Lieu {index + 1}</span>
                  <button
                    onClick={() => onRemoveLocation(index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={location.name}
                    onChange={(e) => onUpdateLocation(index, { name: e.target.value })}
                    placeholder="Nom du lieu"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => onUpdateLocation(index, { address: e.target.value })}
                    placeholder="Adresse complète"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none"
                  />
                  <textarea
                    rows={2}
                    value={location.notes}
                    onChange={(e) => onUpdateLocation(index, { notes: e.target.value })}
                    placeholder="Informations complémentaires (accès, parking, etc.)"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Contacts */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider">
              Contacts importants
            </label>
            <div className="flex gap-2">
              <Button
                onClick={onAddImportantContact}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                + Ajouter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white text-xs"
              >
                📇 Répertoire
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {callSheet.important_contacts.map((contact, index) => (
              <div key={contact.id} className="bg-call-times-gray-light border border-call-times-gray-medium rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-medium text-sm">Contact {index + 1}</span>
                  <button
                    onClick={() => onRemoveImportantContact(index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => onUpdateImportantContact(index, { name: e.target.value })}
                    placeholder="Nom complet"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={contact.role}
                    onChange={(e) => onUpdateImportantContact(index, { role: e.target.value })}
                    placeholder="Poste/fonction"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => onUpdateImportantContact(index, { phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none"
                  />
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => onUpdateImportantContact(index, { email: e.target.value })}
                    placeholder="email@exemple.com"
                    className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
            Logo (agence/prod/marque)
          </label>
          <div className="border-2 border-dashed border-call-times-gray-light rounded-lg p-6 text-center">
            <div className="text-call-times-text-muted text-sm mb-2">
              📎 Import logo
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-light text-xs"
            >
              Choisir fichier
            </Button>
            <div className="text-call-times-text-disabled text-xs mt-2">
              PNG, JPG jusqu'à 2MB
            </div>
          </div>
        </div>
        
        {/* Notes générales */}
        <div>
          <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
            Notes générales
          </label>
          <textarea
            rows={3}
            value={callSheet.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Informations à communiquer à l'équipe..."
            className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-3 text-white placeholder:text-call-times-text-disabled focus:border-call-times-accent focus:bg-call-times-gray-light outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  )
}

function PlanningSection({ 
  callSheet, 
  onUpdate,
  onUpdateScheduleItem 
}: { 
  callSheet: typeof mockCallSheet
  onUpdate: (updates: Partial<typeof mockCallSheet>) => void
  onUpdateScheduleItem: (index: number, updates: Partial<typeof mockCallSheet.schedule[0]>) => void
}) {
  const addScheduleItem = () => {
    const newItem = {
      id: Date.now(),
      title: '',
      time: ''
    }
    const updatedSchedule = [...callSheet.schedule, newItem]
    
    // Tri automatique : les éléments sans heure vont à la fin
    updatedSchedule.sort((a, b) => {
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
    
    onUpdate({
      schedule: updatedSchedule
    })
  }

  const removeScheduleItem = (index: number) => {
    onUpdate({
      schedule: callSheet.schedule.filter((_, i) => i !== index)
    })
  }

  const addQuickItem = (title: string) => {
    const newItem = {
      id: Date.now(),
      title,
      time: ''
    }
    const updatedSchedule = [...callSheet.schedule, newItem]
    
    // Tri automatique : les éléments sans heure vont à la fin
    updatedSchedule.sort((a, b) => {
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
    
    onUpdate({
      schedule: updatedSchedule
    })
  }

  const addQuickItemWithTime = (title: string, time: string) => {
    const newItem = {
      id: Date.now(),
      title,
      time
    }
    const updatedSchedule = [...callSheet.schedule, newItem]
    
    // Tri automatique par heure
    updatedSchedule.sort((a, b) => {
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
    
    onUpdate({
      schedule: updatedSchedule
    })
  }

  return (
    <div>
      <div className="mb-6 pb-3 border-b-2 border-red-500">
        <h3 className="text-red-500 font-semibold text-sm uppercase tracking-wider">
          PLANNING
        </h3>
      </div>
      
      {/* Quick Add Section */}
      <div className="bg-call-times-gray-medium border border-call-times-gray-light rounded-lg p-4 mb-6">
        <div className="text-call-times-text-muted text-xs uppercase tracking-wider mb-3">
          Quick adds:
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: 'Call time — Production', time: '08:00' },
            { title: 'Start shooting', time: '09:30' },
            { title: 'Lunch', time: '13:00' },
            { title: 'Wrap', time: '18:00' },
            { title: 'End of day', time: '19:00' }
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => addQuickItemWithTime(item.title, item.time)}
              className="bg-call-times-gray-light border border-call-times-gray-medium text-call-times-text-secondary p-2 rounded text-xs hover:bg-call-times-gray-medium hover:text-white transition-all"
            >
              <div>{item.title}</div>
              <div className="text-call-times-text-disabled text-xs">{item.time}</div>
            </button>
          ))}
          <button
            onClick={addScheduleItem}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded text-xs font-semibold"
          >
            + Personnalisé
          </button>
        </div>
      </div>
      
      {/* Schedule Items - Cards éditables */}
      <div className="space-y-3">
        {callSheet.schedule.map((item, index) => (
          <div key={item.id} className="bg-call-times-gray-medium border border-call-times-gray-light rounded-lg p-4 border-l-4 border-l-red-500">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                  #{index + 1}
                </span>
                <span className="text-white font-medium text-sm">
                  {item.time ? `${item.time}` : 'Sans heure'}
                </span>
              </div>
              <button
                onClick={() => removeScheduleItem(index)}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                Supprimer
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                  Événement
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => onUpdateScheduleItem(index, { title: e.target.value })}
                  placeholder="Call time, Start shooting..."
                  className="w-full bg-call-times-gray-light border border-call-times-gray-medium rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                  Heure
                </label>
                <input
                  type="time"
                  value={item.time}
                  onChange={(e) => onUpdateScheduleItem(index, { time: e.target.value })}
                  className="w-full bg-call-times-gray-light border border-call-times-gray-medium rounded p-2 text-white text-sm focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
        
        {callSheet.schedule.length === 0 && (
          <div className="text-center py-8">
            <div className="text-call-times-text-muted text-sm mb-4">
              Aucun horaire défini. Utilisez les quick adds ci-dessus.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EquipeSection({ 
  callSheet, 
  onAddTeamMember, 
  onUpdateTeamMember, 
  onRemoveTeamMember 
}: { 
  callSheet: typeof mockCallSheet
  onAddTeamMember: () => void
  onUpdateTeamMember: (index: number, updates: Partial<typeof mockCallSheet.team[0]>) => void
  onRemoveTeamMember: (index: number) => void
}) {
  const departments = ['Production', 'Régie', 'Camera', 'Réalisation', 'HMC', 'Son', 'Maquillage', 'Costumes', 'Autre'] as const
  
  // Organiser les membres par département
  const membersByDepartment = callSheet.team.reduce((acc, member, index) => {
    const dept = member.department || 'Autre'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push({ ...member, index })
    return acc
  }, {} as Record<string, Array<typeof callSheet.team[0] & { index: number }>>)

  const getDepartmentColor = (dept: string) => {
    const colors = {
      'Production': 'bg-green-500',
      'Régie': 'bg-blue-500',
      'Camera': 'bg-purple-500',
      'Réalisation': 'bg-red-500',
      'HMC': 'bg-pink-500',
      'Son': 'bg-yellow-500',
      'Maquillage': 'bg-orange-500',
      'Costumes': 'bg-indigo-500',
      'Autre': 'bg-gray-500'
    }
    return colors[dept as keyof typeof colors] || 'bg-gray-500'
  }

  const getDepartmentCode = (dept: string) => {
    const codes = {
      'Production': 'PROD',
      'Régie': 'REGIE',
      'Camera': 'CAM',
      'Réalisation': 'REAL',
      'HMC': 'HMC',
      'Son': 'SON',
      'Maquillage': 'MU',
      'Costumes': 'COST',
      'Autre': 'OTHER'
    }
    return codes[dept as keyof typeof codes] || 'OTHER'
  }

  return (
    <div>
      <div className="mb-6 pb-3 border-b-2 border-green-500">
        <h3 className="text-green-500 font-semibold text-sm uppercase tracking-wider">
          ÉQUIPE
        </h3>
      </div>
      
      {/* Actions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-semibold">Équipe de tournage</h4>
          <span className="text-call-times-text-muted text-sm">
            {callSheet.team.length} personne{callSheet.team.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button
            onClick={onAddTeamMember}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            + Ajouter manuel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white text-xs"
          >
            📇 Depuis répertoire
          </Button>
        </div>
        
        <p className="text-call-times-text-muted text-sm mb-4">
          Organisez automatiquement par département.
        </p>
      </div>

      {/* Membres par département */}
      <div className="space-y-4">
        {Object.entries(membersByDepartment).map(([department, members]) => (
          <div key={department} className="bg-call-times-gray-medium border border-call-times-gray-light rounded-lg border-l-4 border-l-green-500">
            <div className="flex justify-between items-center p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <span className={`${getDepartmentColor(department)} text-white px-2 py-1 rounded text-xs font-semibold uppercase`}>
                  {getDepartmentCode(department)}
                </span>
                <span className="text-white font-semibold">{department}</span>
              </div>
              <span className={`${getDepartmentColor(department)} text-white px-2 py-1 rounded text-xs font-semibold`}>
                {members.length}
              </span>
            </div>
            
            {members.map((member) => (
              <div key={member.id} className="bg-call-times-gray-light border border-call-times-gray-medium rounded m-4 p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-medium text-sm">Membre {member.index + 1}</span>
                  <button
                    onClick={() => onRemoveTeamMember(member.index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => onUpdateTeamMember(member.index, { name: e.target.value })}
                      placeholder="Prénom Nom"
                      className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      Poste
                    </label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => onUpdateTeamMember(member.index, { role: e.target.value })}
                      placeholder="Régisseur, Chef op..."
                      className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      Département
                    </label>
                    <select
                      value={member.department}
                      onChange={(e) => onUpdateTeamMember(member.index, { department: e.target.value as any })}
                      className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white text-sm focus:border-green-500 outline-none"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      Call Time
                    </label>
                    <input
                      type="time"
                      value={member.call_time || ''}
                      onChange={(e) => onUpdateTeamMember(member.index, { call_time: e.target.value })}
                      className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white text-sm focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={member.phone || ''}
                      onChange={(e) => onUpdateTeamMember(member.index, { phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-green-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-call-times-text-secondary text-xs font-medium uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={member.email || ''}
                      onChange={(e) => onUpdateTeamMember(member.index, { email: e.target.value })}
                      placeholder="email@exemple.com"
                      className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-2 text-white placeholder:text-call-times-text-disabled text-sm focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
                
                <div className={`${getDepartmentColor(member.department)} text-white px-2 py-1 rounded text-xs font-medium inline-block`}>
                  {member.department}
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {callSheet.team.length === 0 && (
          <div className="text-center py-8">
            <div className="text-call-times-text-muted text-sm mb-4">
              Aucun membre d'équipe. Utilisez les boutons ci-dessus pour ajouter.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ParametresSection() {
  return (
    <div>
      <div className="mb-6 pb-3 border-b-2 border-orange-500">
        <h3 className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
          PARAMÈTRES
        </h3>
      </div>
      
      <div className="bg-call-times-gray-light border border-call-times-gray-medium rounded p-4 mb-6">
        <p className="text-call-times-text-muted text-xs leading-relaxed">
          Les options de personnalisation avancées seront bientôt disponibles
        </p>
      </div>
      
      <div>
        <label className="block text-call-times-text-secondary text-sm font-medium uppercase tracking-wider mb-2">
          Thèmes personnalisés
        </label>
        <select 
          disabled
          className="w-full bg-call-times-gray-medium border border-call-times-gray-light rounded p-3 text-call-times-text-disabled cursor-not-allowed"
        >
          <option>Bientôt disponible</option>
        </select>
      </div>
    </div>
  )
}

function PreviewArea({ callSheet }: { callSheet: typeof mockCallSheet }) {
  return (
    <div className="flex-1 bg-call-times-black flex flex-col">
      {/* Preview Toolbar */}
      <div className="bg-call-times-gray-dark border-b border-call-times-gray-light px-6 py-3 flex justify-between items-center">
        <span className="text-white font-semibold text-sm">Aperçu temps réel</span>
        <div className="flex items-center gap-2 text-call-times-text-disabled text-xs">
          <button className="bg-call-times-gray-medium border border-call-times-gray-light text-call-times-text-secondary w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-call-times-gray-light hover:text-white transition-all">
            -
          </button>
          <span>75%</span>
          <button className="bg-call-times-gray-medium border border-call-times-gray-light text-call-times-text-secondary w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-call-times-gray-light hover:text-white transition-all">
            +
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div className="flex-1 p-8 overflow-auto flex justify-center items-start">
        <div className="bg-white shadow-2xl rounded max-w-2xl w-full min-h-[800px] p-0 text-black">
          {/* Header professionnel */}
          <div className="flex justify-between items-center px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-wider">VOTRE PRODUCTION</div>
            <div className="text-xs font-bold uppercase tracking-wider">CALL SHEET</div>
          </div>

          {/* Titre centré */}
          <div className="text-center py-4">
            <h1 className="text-lg font-bold uppercase mb-1">
              {callSheet.title}
            </h1>
            <div className="text-xs font-medium">
              {new Date(callSheet.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Lieux de tournage */}
            {callSheet.locations.length > 0 && (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  {callSheet.locations.map((location, index) => (
                    <div key={location.id} className="bg-gray-100 p-2.5 rounded">
                      <div className="text-xs text-gray-600 uppercase font-bold mb-1">
                        {callSheet.locations.length > 1 ? `Lieu ${index + 1}` : 'Lieu de tournage'}
                      </div>
                      <div className="font-semibold text-xs">{location.name || 'Non défini'}</div>
                      {location.address && (
                        <div className="text-xs text-gray-600 mt-0.5">{location.address}</div>
                      )}
                      {location.notes && (
                        <div className="text-xs text-gray-500 mt-0.5 italic">{location.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Production */}
            {callSheet.important_contacts.length > 0 && (
              <div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-xs text-gray-600 uppercase font-bold mb-2 text-center">
                    CONTACTS PRODUCTION
                  </div>
                  <div className="space-y-1">
                    {callSheet.important_contacts.map((contact, index) => (
                      <div key={contact.id} className="grid grid-cols-4 gap-2 text-xs border-b border-gray-300 pb-1">
                        <div className="font-semibold">{contact.role || 'Poste'}</div>
                        <div className="font-medium">{contact.name || `Contact ${index + 1}`}</div>
                        <div className="text-gray-600">{contact.phone || 'N/A'}</div>
                        <div className="text-gray-600">{contact.email || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            {callSheet.schedule.length > 0 && (
              <div>
                <div className="bg-gray-100 p-3 rounded">
                  <div className="text-xs text-gray-600 uppercase font-bold mb-2 text-center">
                    SCHEDULE
                  </div>
                  <div className="space-y-0">
                    {callSheet.schedule.map((item) => (
                      <div key={item.id} className="grid grid-cols-2 gap-3 text-xs border-b border-gray-300 py-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="font-bold text-right">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Crew Call (Section équipe - placeholder) */}
            <div>
              <div className="bg-gray-100 p-3 rounded">
                <div className="text-xs text-gray-600 uppercase font-bold mb-2 text-center">
                  CREW CALL
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs font-bold border-b-2 border-gray-400 pb-1 mb-1">
                  <div>POSITION</div>
                  <div>NAME</div>
                  <div>TEL</div>
                  <div>CALL</div>
                  <div>ON SET</div>
                </div>
                
                {/* Tri par département et affichage */}
                {callSheet.team
                  .sort((a, b) => a.department.localeCompare(b.department))
                  .map((member) => (
                    <div key={member.id} className="grid grid-cols-5 gap-2 text-xs border-b border-gray-300 py-0.5">
                      <div className="uppercase font-medium">{member.department.toUpperCase()}</div>
                      <div className="font-medium">{member.name || 'Sans nom'}</div>
                      <div className="text-gray-600">{member.phone || 'N/A'}</div>
                      <div className="font-semibold">{member.call_time || 'N/A'}</div>
                      <div className="text-blue-600 font-semibold">{member.on_set_time || 'N/A'}</div>
                    </div>
                  ))}
                
                {/* Ligne exemple si pas d'équipe */}
                {callSheet.team.length === 0 && (
                  <div className="grid grid-cols-5 gap-2 text-xs border-b border-gray-300 py-0.5">
                    <div className="uppercase font-medium">PRODUCTION</div>
                    <div className="font-medium">Line Producer</div>
                    <div className="text-gray-600">+33 6 12 33 44</div>
                    <div className="font-semibold">07:30</div>
                    <div className="text-blue-600 font-semibold">09:30</div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {callSheet.notes && (
              <div className="border-t border-gray-300 pt-3">
                <div className="text-xs text-gray-600 uppercase font-bold mb-2">
                  NOTES IMPORTANTES
                </div>
                <div className="text-xs leading-relaxed bg-yellow-50 p-2.5 rounded border-l-4 border-yellow-400">
                  {callSheet.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CallSheetEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('informations')
  const [callSheet, setCallSheet] = useState(mockCallSheet)

  // Handler pour mettre à jour les données en temps réel
  const updateCallSheet = (updates: Partial<typeof mockCallSheet>) => {
    setCallSheet(prev => ({ ...prev, ...updates }))
  }

  const updateScheduleItem = (index: number, updates: Partial<typeof mockCallSheet.schedule[0]>) => {
    setCallSheet(prev => {
      const updatedSchedule = prev.schedule.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
      
      // Tri automatique par heure si l'heure a été modifiée
      if (updates.time) {
        updatedSchedule.sort((a, b) => {
          // Si une des heures est vide, la mettre à la fin
          if (!a.time) return 1
          if (!b.time) return -1
          
          // Comparer les heures au format HH:MM
          return a.time.localeCompare(b.time)
        })
      }
      
      return {
        ...prev,
        schedule: updatedSchedule
      }
    })
  }

  const addLocation = () => {
    const newLocation = {
      id: Date.now(),
      name: '',
      address: '',
      notes: ''
    }
    setCallSheet(prev => ({
      ...prev,
      locations: [...prev.locations, newLocation]
    }))
  }

  const updateLocation = (index: number, updates: Partial<typeof mockCallSheet.locations[0]>) => {
    setCallSheet(prev => ({
      ...prev,
      locations: prev.locations.map((location, i) =>
        i === index ? { ...location, ...updates } : location
      )
    }))
  }

  const removeLocation = (index: number) => {
    setCallSheet(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }))
  }

  const addImportantContact = () => {
    const newContact = {
      id: Date.now(),
      name: '',
      role: '',
      phone: '',
      email: ''
    }
    setCallSheet(prev => ({
      ...prev,
      important_contacts: [...prev.important_contacts, newContact]
    }))
  }

  const updateImportantContact = (index: number, updates: Partial<typeof mockCallSheet.important_contacts[0]>) => {
    setCallSheet(prev => ({
      ...prev,
      important_contacts: prev.important_contacts.map((contact, i) =>
        i === index ? { ...contact, ...updates } : contact
      )
    }))
  }

  const removeImportantContact = (index: number) => {
    setCallSheet(prev => ({
      ...prev,
      important_contacts: prev.important_contacts.filter((_, i) => i !== index)
    }))
  }

  const addTeamMember = () => {
    const newMember = {
      id: Date.now(),
      name: '',
      role: '',
      department: 'Production' as const,
      phone: '',
      email: '',
      call_time: '',
      on_set_time: '',
      order: callSheet.team.length
    }
    setCallSheet(prev => ({
      ...prev,
      team: [...prev.team, newMember]
    }))
  }

  const updateTeamMember = (index: number, updates: Partial<typeof callSheet.team[0]>) => {
    setCallSheet(prev => ({
      ...prev,
      team: prev.team.map((member, i) =>
        i === index ? { ...member, ...updates } : member
      )
    }))
  }

  const removeTeamMember = (index: number) => {
    setCallSheet(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-call-times-black flex flex-col">
      {/* Header */}
      <header className="bg-call-times-black border-b border-call-times-gray-light px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link 
            href="/projects" 
            className="text-call-times-text-muted hover:text-white transition-all flex items-center gap-2 text-sm"
          >
            ← Retour au projet
          </Link>
          <div>
            <h1 className="text-white font-bold text-lg">{callSheet.title}</h1>
            <div className="text-call-times-text-disabled text-sm">
              Call Sheet • jeudi 25 septembre 2025
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-call-times-accent rounded-full" />
            <span className="text-sm text-white">Aperçu temps réel</span>
          </div>
          <div className="text-call-times-text-disabled text-sm">Non sauvegardé</div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-call-times-gray-light border-call-times-gray-medium text-white hover:bg-call-times-gray-medium">
            Brouillon
          </Button>
          <Button className="bg-call-times-accent text-black hover:bg-call-times-accent-hover">
            Finaliser Call Sheet
          </Button>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 flex">
        <EditorSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          callSheet={callSheet}
          onUpdateCallSheet={updateCallSheet}
          onUpdateScheduleItem={updateScheduleItem}
          onAddLocation={addLocation}
          onUpdateLocation={updateLocation}
          onRemoveLocation={removeLocation}
          onAddImportantContact={addImportantContact}
          onUpdateImportantContact={updateImportantContact}
          onRemoveImportantContact={removeImportantContact}
          onAddTeamMember={addTeamMember}
          onUpdateTeamMember={updateTeamMember}
          onRemoveTeamMember={removeTeamMember}
        />
        <PreviewArea callSheet={callSheet} />
      </div>
    </div>
  )
}
