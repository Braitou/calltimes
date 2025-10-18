'use client'

import React from 'react'

export function ContactsDirectoryMockup() {
  const [activeDept, setActiveDept] = React.useState('Tous')
  
  const allContacts = [
    { name: 'Pierre Lambert', role: 'Réalisateur', dept: 'Réalisation', deptColor: 'rgba(59, 130, 246, 0.15)', deptText: '#3b82f6', initials: 'PL' },
    { name: 'Sophie Moreau', role: 'Directrice Photo', dept: 'Image', deptColor: 'rgba(168, 85, 247, 0.15)', deptText: '#a855f7', initials: 'SM' },
    { name: 'Thomas Bernard', role: 'Ingénieur Son', dept: 'Son', deptColor: 'rgba(34, 197, 94, 0.15)', deptText: '#22c55e', initials: 'TB' },
    { name: 'Julie Petit', role: 'Maquilleuse', dept: 'Maquillage', deptColor: 'rgba(236, 72, 153, 0.15)', deptText: '#ec4899', initials: 'JP' },
    { name: 'Marc Dubois', role: 'Régisseur', dept: 'Production', deptColor: 'rgba(251, 191, 36, 0.15)', deptText: '#fbbf24', initials: 'MD' },
    { name: 'Claire Martin', role: 'Script', dept: 'Réalisation', deptColor: 'rgba(59, 130, 246, 0.15)', deptText: '#3b82f6', initials: 'CM' },
    { name: 'Lucas Petit', role: 'Cadreur', dept: 'Image', deptColor: 'rgba(168, 85, 247, 0.15)', deptText: '#a855f7', initials: 'LP' },
    { name: 'Emma Rousseau', role: 'Perchman', dept: 'Son', deptColor: 'rgba(34, 197, 94, 0.15)', deptText: '#22c55e', initials: 'ER' },
    { name: 'Antoine Blanc', role: 'Assistant Réal', dept: 'Réalisation', deptColor: 'rgba(59, 130, 246, 0.15)', deptText: '#3b82f6', initials: 'AB' },
    { name: 'Marie Durand', role: 'Chargée de Prod', dept: 'Production', deptColor: 'rgba(251, 191, 36, 0.15)', deptText: '#fbbf24', initials: 'MD2' },
  ]

  const contacts = activeDept === 'Tous' 
    ? allContacts 
    : allContacts.filter(c => c.dept === activeDept)

  const departments = ['Tous', 'Réalisation', 'Image', 'Son', 'Production']
  const deptCounts = {
    'Tous': allContacts.length,
    'Réalisation': allContacts.filter(c => c.dept === 'Réalisation').length,
    'Image': allContacts.filter(c => c.dept === 'Image').length,
    'Son': allContacts.filter(c => c.dept === 'Son').length,
    'Production': allContacts.filter(c => c.dept === 'Production').length,
  }

  return (
    <div className="w-full h-full bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* Page Header */}
      <div className="bg-black border-b border-gray-800 p-6">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Contact Directory</h1>
        <p className="text-sm text-gray-500">Votre arsenal humain pour dominer toutes les productions</p>
      </div>

      {/* Toolbar */}
      <div className="bg-black border-b border-gray-800 px-6 py-3 flex items-center justify-between gap-3">
        <input 
          type="text" 
          placeholder="Rechercher par nom, email..." 
          className="flex-1 max-w-md bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600"
          readOnly
        />
        <div className="flex gap-2">
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-semibold border border-gray-700">
            ☰
          </button>
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-semibold border border-gray-700">
            ▦
          </button>
          <button className="bg-[#4ade80] text-black px-4 py-1.5 rounded text-xs font-bold">
            Nouveau Contact
          </button>
        </div>
      </div>

      {/* Department Filters */}
      <div className="bg-black border-b border-gray-800 px-6 py-3">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Filtrer par département</div>
        <div className="flex gap-2 flex-wrap">
          {departments.map((dept) => (
            <button 
              key={dept} 
              onClick={() => setActiveDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                activeDept === dept 
                  ? 'bg-[#4ade80] text-black' 
                  : 'bg-[#111] text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
            >
              {dept} <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] ${activeDept === dept ? 'bg-black/20' : 'bg-white/10'}`}>{deptCounts[dept as keyof typeof deptCounts]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-black max-h-[500px] overflow-y-auto">
        <div className="px-6 py-2 text-xs text-gray-500 sticky top-0 bg-black z-10">
          <strong className="text-white font-bold">{contacts.length}</strong> contact{contacts.length > 1 ? 's' : ''} {activeDept !== 'Tous' ? `en ${activeDept}` : 'dans votre répertoire'}
        </div>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl mx-6 mb-6 overflow-hidden">
          {/* List Header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_80px] gap-4 px-6 py-3 bg-[#0a0a0a] border-b border-gray-900 text-[9px] font-semibold uppercase tracking-wider text-gray-600">
            <div>Contact</div>
            <div>Département</div>
            <div>Email</div>
            <div>Actions</div>
          </div>

          {/* Contact Rows */}
          {contacts.map((contact, i) => (
            <div 
              key={i} 
              className="grid grid-cols-[2fr_1.5fr_1fr_80px] gap-4 px-6 py-3 border-b border-gray-900 last:border-b-0 hover:bg-[#1a1a1a] transition-colors cursor-pointer group relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-[#4ade80] transition-colors" />
              
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-[10px] flex-shrink-0"
                  style={{ background: '#4ade80' }}
                >
                  {contact.initials}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white">{contact.name}</div>
                  <div className="text-[9px] text-gray-500">{contact.role}</div>
                </div>
              </div>
              
              <div>
                <span 
                  className="px-2 py-1 rounded text-[9px] font-semibold uppercase tracking-wider inline-block"
                  style={{ backgroundColor: contact.deptColor, color: contact.deptText }}
                >
                  {contact.dept}
                </span>
              </div>
              
              <div className="text-[10px] text-gray-500 flex items-center">
                {contact.name.toLowerCase().replace(' ', '.')}@gmail.com
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 bg-gray-800 border border-gray-700 rounded flex items-center justify-center text-[10px] hover:bg-gray-700">
                  ✏️
                </button>
                <button className="w-7 h-7 bg-gray-800 border border-gray-700 rounded flex items-center justify-center text-[10px] hover:bg-red-900/20 hover:border-red-500">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProjectHubMockup() {
  const [selectedFile, setSelectedFile] = React.useState<string | null>('Call Sheets')
  
  const tools = [
    { name: 'Call Sheet', icon: '📄' },
    { name: 'Crew List', icon: '👥' },
    { name: 'Contacts', icon: '➕' },
    { name: 'Email', icon: '✉️' },
    { name: 'Upload', icon: '📤' },
  ]

  const teamMembers = [
    { name: 'Simon Bandiera', email: 'simon@calltimes.app', role: 'Owner', initials: 'SB', isGuest: false },
    { name: 'Victor Dupont', email: 'victor@calltimes.app', role: 'Member', initials: 'VD', isGuest: false },
    { name: 'Philip Martin', email: 'philip@elec.com', role: 'Guest Editor', initials: 'PM', isGuest: true },
  ]

  const files: Array<{
    name: string
    type: 'folder' | 'image' | 'pdf' | 'spreadsheet'
    color: string
    x: number
    y: number
    count?: string
    private?: boolean
  }> = [
    { name: 'Call Sheets', type: 'folder', color: '#fbbf24', x: 50, y: 40, count: '3 files' },
    { name: 'Deck Créatif', type: 'folder', color: '#fbbf24', x: 180, y: 40, count: '5 files' },
    { name: 'Scripts', type: 'folder', color: '#fbbf24', x: 310, y: 40, count: '2 files' },
    { name: 'Budget', type: 'folder', color: '#fbbf24', x: 440, y: 40, count: '1 file' },
    { name: 'Moodboard', type: 'image', color: '#a855f7', x: 50, y: 180 },
    { name: 'Script.pdf', type: 'pdf', color: '#f97316', x: 180, y: 180 },
    { name: 'Budget.xlsx', type: 'spreadsheet', color: '#3b82f6', x: 310, y: 180 },
    { name: 'Storyboard', type: 'image', color: '#a855f7', x: 440, y: 180 },
    // Private zone files
    { name: 'Contrats', type: 'folder', color: '#fbbf24', x: 50, y: 380, count: '8 files', private: true },
    { name: 'Devis.pdf', type: 'pdf', color: '#f97316', x: 180, y: 380, private: true },
    { name: 'Notes Prod', type: 'folder', color: '#fbbf24', x: 310, y: 380, count: '12 files', private: true },
  ]

  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* Canvas Header */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="text-sm font-bold uppercase tracking-wide">Documents</div>
        <div className="flex gap-2">
          <button className="bg-[#111] border border-gray-700 px-3 py-1.5 rounded text-[10px] text-gray-400 font-semibold hover:bg-gray-800">
            Grid
          </button>
          <button className="bg-[#4ade80] text-black px-3 py-1.5 rounded text-[10px] font-bold">
            Upload
          </button>
        </div>
      </div>

      {/* 3 Column Layout - 20% Tools / 40% Canvas / 40% Team */}
      <div className="grid grid-cols-[20%_40%_40%] h-[600px]">
        {/* Left Sidebar - Tools (Compact) */}
        <div className="bg-[#0a0a0a] border-r border-gray-800 p-3">
          <div className="mb-3">
            <div className="text-xs font-bold mb-0.5 truncate">Nike Air Max</div>
            <div className="text-[8px] text-gray-600">11 docs • 3 team</div>
          </div>
          
          <div className="text-[8px] font-bold text-gray-600 uppercase tracking-wider mb-2">Quick Actions</div>
          
          <div className="space-y-1.5">
            {tools.map((tool, i) => (
              <button 
                key={i} 
                className="w-full bg-[#111] border border-gray-800 rounded p-2 hover:bg-[#1a1a1a] transition-colors group relative"
                title={tool.name}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-[#4ade80] rounded-l transition-colors" />
                <div className="flex items-center gap-2">
                  <span className="text-base">{tool.icon}</span>
                  <span className="text-[9px] font-semibold text-white truncate">{tool.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center - Desktop Canvas */}
        <div className="bg-[#0a0a0a] relative overflow-auto">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(74, 222, 128, 1) 19px, rgba(74, 222, 128, 1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(74, 222, 128, 1) 19px, rgba(74, 222, 128, 1) 20px)',
              backgroundSize: '80px 80px'
            }}
          />
          
          {/* Desktop Icons */}
          <div className="relative p-8 min-h-[550px]">
            {files.map((file, i) => (
              <div 
                key={i}
                onClick={() => setSelectedFile(file.name)}
                className={`absolute w-20 cursor-pointer hover:scale-105 transition-all ${
                  selectedFile === file.name ? 'scale-105' : ''
                }`}
                style={{ left: file.x, top: file.y }}
              >
                <div className={`flex flex-col items-center gap-1 p-2 rounded transition-all ${
                  selectedFile === file.name 
                    ? 'bg-[#4ade80]/20 border border-[#4ade80]' 
                    : 'hover:bg-[#4ade80]/10'
                }`}>
                  {file.type === 'folder' ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={file.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
                    </svg>
                  ) : file.type === 'pdf' ? (
                    <div className="w-9 h-12 bg-gradient-to-br from-white to-gray-100 rounded border border-gray-300 shadow-md relative">
                      <div className="absolute inset-2 opacity-30">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-full h-[2px] bg-orange-500 mb-1.5" />
                        ))}
                      </div>
                    </div>
                  ) : file.type === 'image' ? (
                    <div className="w-9 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded border border-purple-300 shadow-md relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full opacity-40" />
                    </div>
                  ) : (
                    <div className="w-9 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded border border-blue-300 shadow-md relative">
                      <div className="absolute inset-2 grid grid-cols-2 gap-[2px]">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="border border-blue-400 opacity-20" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-[8px] font-medium text-white text-center leading-tight max-w-full truncate" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {file.name}
                  </div>
                  {file.count && (
                    <div className="text-[7px] font-semibold text-[#4ade80]">{file.count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Private Zone Separator */}
          <div className="absolute top-[320px] left-0 right-0 border-t-2 border-dashed border-red-500/30" />
          <div className="absolute top-[328px] left-8 text-[10px] text-red-400 font-bold flex items-center gap-1.5 bg-[#0a0a0a] px-3 py-1.5 rounded border border-red-500/30">
            <span>🔒</span>
            <span>PRIVATE ZONE - Organization Only</span>
          </div>
        </div>

        {/* Right Sidebar - Team Collaboration */}
        <div className="bg-[#0a0a0a] border-l border-gray-800 p-4 overflow-y-auto">
          {/* Team Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wide">Team</h3>
              <span className="text-[10px] text-gray-600 font-semibold">{teamMembers.length} members</span>
            </div>
            
            {/* Invite Input */}
            <div className="flex gap-1.5 mb-4">
              <input 
                type="email" 
                placeholder="Invite by email..." 
                className="flex-1 bg-[#111] border border-gray-700 rounded px-2.5 py-2 text-[10px] text-white placeholder-gray-600 focus:border-[#4ade80] focus:outline-none transition-colors"
                readOnly
              />
              <button className="bg-[#4ade80] text-black w-9 h-9 rounded flex items-center justify-center font-bold hover:bg-[#22c55e] transition-colors">
                +
              </button>
            </div>
          </div>

          {/* Organization Members Section */}
          <div className="mb-6">
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4ade80] rounded-full" />
              Organization Members
            </div>
            <div className="space-y-2">
              {teamMembers.filter(m => !m.isGuest).map((member, i) => (
                <div 
                  key={i} 
                  className="bg-[#111] border border-gray-800 rounded-lg p-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4ade80] rounded-full flex items-center justify-center text-black font-bold text-xs flex-shrink-0">
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white mb-0.5">{member.name}</div>
                      <div className="text-[9px] text-gray-500">{member.email}</div>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-[#4ade80]/20 text-[#4ade80] rounded text-[8px] font-bold uppercase tracking-wide">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Permissions */}
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-gray-600">Access:</span>
                      <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[8px]">✓ Public</span>
                        <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[8px]">✓ Private</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Section */}
          <div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Guest Access
            </div>
            <div className="space-y-2">
              {teamMembers.filter(m => m.isGuest).map((member, i) => (
                <div 
                  key={i} 
                  className="bg-[#111] border border-orange-500/30 rounded-lg p-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 border-2 border-orange-500/50 rounded-full flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white mb-0.5">{member.name}</div>
                      <div className="text-[9px] text-gray-500">{member.email}</div>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[8px] font-bold uppercase tracking-wide">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Limited Permissions */}
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-gray-600">Access:</span>
                      <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[8px]">✓ Public</span>
                        <span className="px-1.5 py-0.5 bg-gray-700 text-gray-500 rounded text-[8px]">✗ Private</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 text-sm">ℹ️</span>
              <div className="flex-1">
                <div className="text-[9px] text-blue-300 font-semibold mb-1">Shared Workspace</div>
                <div className="text-[8px] text-blue-400/80 leading-relaxed">
                  Organization members can access all files. Guests can only view public zone files.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CallSheetEditorMockup() {
  const [activeSection, setActiveSection] = React.useState('informations')
  const [callSheetTitle, setCallSheetTitle] = React.useState('Call Sheet (25 septembre 2025)')
  const [shootingDate, setShootingDate] = React.useState('2025-09-25')
  const [location, setLocation] = React.useState('')
  
  const scheduleItems = [
    { title: 'Call time — Production', time: '08:00', color: '#ef4444' },
    { title: 'Start Shooting', time: '09:30', color: '#ef4444' },
    { title: 'Lunch', time: '13:00', color: '#ef4444' },
  ]

  const sections = [
    { id: 'informations', name: 'Informations', color: '#3b82f6', bgColor: '#1e3a8a' },
    { id: 'planning', name: 'Planning', color: '#ef4444', bgColor: '#991b1b' },
    { id: 'equipe', name: 'Équipe', color: '#4ade80', bgColor: '#166534' },
    { id: 'parametres', name: 'Paramètres', color: '#f97316', bgColor: '#7c2d12' },
  ]

  const formatDate = (dateString: string) => {
    if (!dateString) return 'jeudi 25 septembre 2025'
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('fr-FR', options)
  }

  return (
    <div className="w-full h-full bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-white text-sm">← Retour au projet</button>
          <div className="border-l border-gray-800 pl-3">
            <div className="text-sm font-bold">Call Sheet (25 septembre 2025)</div>
            <div className="text-[9px] text-gray-600">Call Sheet • jeudi 25 septembre 2025</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-[#4ade80] rounded-full" />
            <span className="text-gray-400">Aperçu temps réel</span>
          </div>
          <div className="text-[10px] text-gray-600">Non sauvegardé</div>
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded text-[10px] font-semibold border border-gray-700">
            Brouillon
          </button>
          <button className="bg-[#4ade80] text-black px-3 py-1.5 rounded text-[10px] font-bold">
            Finaliser Call Sheet
          </button>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-[280px_1fr] h-[600px]">
        {/* Left - Editor Sidebar */}
        <div className="bg-[#111] border-r border-gray-800 flex flex-col">
          {/* Section Tabs */}
          <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-800">
            {sections.map((section) => (
              <button 
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`rounded-lg p-2 flex flex-col items-center gap-1 border-2 transition-all ${
                  activeSection === section.id
                    ? `border-[${section.color}]`
                    : 'bg-gray-800 border-transparent'
                }`}
                style={activeSection === section.id ? { backgroundColor: section.bgColor, borderColor: section.color } : {}}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: section.color }}
                />
                <span className={`text-[9px] font-bold uppercase tracking-wide ${
                  activeSection === section.id ? 'text-white' : 'text-gray-500'
                }`}>
                  {section.name}
                </span>
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Informations Section */}
            <div className="border-b-2 border-[#3b82f6] pb-3 mb-4">
              <h3 className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider">Informations Générales</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-medium text-gray-400 mb-1 block">Titre du Call Sheet *</label>
                <input 
                  type="text" 
                  value={callSheetTitle}
                  onChange={(e) => {
                    console.log('Titre changé:', e.target.value)
                    setCallSheetTitle(e.target.value)
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-[11px] text-white focus:border-[#3b82f6] focus:outline-none transition-colors"
                  placeholder="Titre de votre call sheet..."
                />
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-400 mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={shootingDate}
                  onChange={(e) => setShootingDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-[11px] text-white focus:border-[#3b82f6] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-400 mb-1 block">Lieu de tournage</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Studio, lieu..." 
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-[11px] text-white placeholder-gray-600 focus:border-[#3b82f6] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[9px] font-medium text-gray-400 mb-1 block">Informations importantes</label>
                <textarea 
                  rows={3} 
                  placeholder="Informations à communiquer à l'équipe..." 
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-[11px] text-white placeholder-gray-600 resize-none focus:border-[#3b82f6] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right - A4 Preview */}
        <div className="bg-[#0a0a0a] flex flex-col">
          {/* Preview Toolbar */}
          <div className="bg-[#111] border-b border-gray-800 px-6 py-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold">Aperçu temps réel</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <button className="w-6 h-6 bg-gray-800 border border-gray-700 rounded flex items-center justify-center hover:bg-gray-700">-</button>
              <span>75%</span>
              <button className="w-6 h-6 bg-gray-800 border border-gray-700 rounded flex items-center justify-center hover:bg-gray-700">+</button>
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 p-6 overflow-auto flex items-start justify-center">
            <div className="w-full max-w-2xl bg-white rounded shadow-2xl p-10 space-y-5">
              {/* Document Header */}
              <div className="text-center border-b-2 border-black pb-5 mb-6">
                <h1 className="text-3xl font-black uppercase mb-3 transition-all duration-300" key={callSheetTitle}>
                  {callSheetTitle.toUpperCase()}
                </h1>
                <p className="text-sm text-gray-600 font-semibold">Call Sheet de Production</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded">
                  <div className="text-[9px] text-gray-600 uppercase mb-1.5 font-bold">Date</div>
                  <div className="text-xs font-semibold text-black transition-all duration-300">{formatDate(shootingDate)}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <div className="text-[9px] text-gray-600 uppercase mb-1.5 font-bold">Lieu de tournage</div>
                  <div className="text-xs font-semibold text-black transition-all duration-300">{location || 'À définir'}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded">
                  <div className="text-[9px] text-gray-600 uppercase mb-1.5 font-bold">Call Time - Production</div>
                  <div className="text-xs font-semibold text-black">08:00</div>
                </div>
              </div>

              {/* Schedule Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-black border-b-2 border-gray-300 pb-2 mb-3">Planning</h3>
                {scheduleItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-[11px] text-gray-700 font-medium">{item.title}</span>
                    <span className="text-[11px] font-bold text-black">{item.time}</span>
                  </div>
                ))}
              </div>

              {/* Team Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-black border-b-2 border-gray-300 pb-2 mb-3">Équipe</h3>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1.5fr] gap-3 py-2 border-b border-gray-200 last:border-b-0 text-[10px]">
                    <span className="text-gray-700 font-semibold">Nom Prénom</span>
                    <span className="text-gray-600">Fonction</span>
                    <span className="text-gray-600">+33 6 XX XX XX XX</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-gray-500 italic pt-5 border-t border-gray-300">
                Call Sheet générée le {new Date().toLocaleDateString('fr-FR')} - BROUILLON
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


