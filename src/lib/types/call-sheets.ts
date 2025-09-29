export interface Location {
  id: string | number
  name: string
  address: string
  notes: string
}

export interface ImportantContact {
  id: string | number
  name: string
  role: string
  phone: string
  email: string
}

export interface CallSheet {
  id: string
  title: string
  date: string
  project_id?: string
  project_name?: string
  locations: Location[]
  important_contacts: ImportantContact[]
  logo_url?: string
  notes?: string
  status: 'draft' | 'finalized' | 'sent'
  created_at: string
  updated_at: string
}

export interface ScheduleItem {
  id: string | number
  title: string
  time: string
  order: number
}

export interface TeamMember {
  id: string | number
  contact_id?: string // Pour les contacts du répertoire
  name: string
  role: string
  department: 'Production' | 'Régie' | 'Camera' | 'Réalisation' | 'HMC' | 'Son' | 'Maquillage' | 'Costumes' | 'Autre'
  phone?: string
  email?: string
  call_time?: string
  on_set_time?: string
  order: number
}

export interface CallSheetData extends CallSheet {
  schedule: ScheduleItem[]
  team: TeamMember[]
}

export type EditorSection = 'informations' | 'planning' | 'equipe' | 'parametres'
