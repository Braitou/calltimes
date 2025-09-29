'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { toast } from 'sonner'

export interface Department {
  id: string
  name: string
  color: string // Couleur hex comme '#3B82F6'
  isDefault: boolean // true pour les départements par défaut non supprimables
}

// Départements par défaut avec couleurs
const defaultDepartments: Department[] = [
  { id: 'realisation', name: 'Réalisation', color: '#3B82F6', isDefault: true },
  { id: 'image', name: 'Image', color: '#8B5CF6', isDefault: true },
  { id: 'son', name: 'Son', color: '#10B981', isDefault: true },
  { id: 'production', name: 'Production', color: '#F59E0B', isDefault: true },
  { id: 'regie', name: 'Régie', color: '#EF4444', isDefault: true },
  { id: 'maquillage', name: 'Maquillage', color: '#EC4899', isDefault: true },
  { id: 'coiffure', name: 'Coiffure', color: '#F97316', isDefault: true },
  { id: 'costumes', name: 'Costumes', color: '#84CC16', isDefault: true },
  { id: 'casting', name: 'Casting', color: '#06B6D4', isDefault: true },
  { id: 'technique', name: 'Technique', color: '#6366F1', isDefault: true },
  { id: 'autre', name: 'Autre', color: '#6B7280', isDefault: true }
]

// Palette de couleurs disponibles
export const colorPalette = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899',
  '#F97316', '#84CC16', '#06B6D4', '#6366F1', '#6B7280', '#14B8A6',
  '#F472B6', '#A855F7', '#22C55E', '#FACC15', '#FB923C', '#F87171',
  '#60A5FA', '#C084FC', '#34D399', '#FBBF24', '#FCA5A5', '#F9A8D4',
  '#A78BFA', '#4ADE80', '#FDE047', '#FDBA74', '#F3F4F6', '#1F2937'
]

interface DepartmentsContextType {
  departments: Department[]
  addDepartment: (name: string, color: string) => void
  updateDepartment: (id: string, updates: Partial<Pick<Department, 'name' | 'color'>>) => void
  deleteDepartment: (id: string) => void
  getDepartmentByName: (name: string) => Department | undefined
  getDepartmentColor: (name: string) => string
}

const DepartmentsContext = createContext<DepartmentsContextType | undefined>(undefined)

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments)

  const addDepartment = (name: string, color: string) => {
    const newDepartment: Department = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      color,
      isDefault: false
    }
    
    setDepartments(prev => [...prev, newDepartment])
    toast.success(`Département "${name}" ajouté avec succès`)
    return newDepartment
  }

  const updateDepartment = (id: string, updates: Partial<Pick<Department, 'name' | 'color'>>) => {
    setDepartments(prev => prev.map(dept => 
      dept.id === id ? { ...dept, ...updates } : dept
    ))
    
    if (updates.name) {
      toast.success(`Département renommé en "${updates.name}"`)
    } else if (updates.color) {
      toast.success('Couleur du département mise à jour')
    }
  }

  const deleteDepartment = (id: string) => {
    const dept = departments.find(d => d.id === id)
    if (dept?.isDefault) {
      toast.error('Impossible de supprimer un département par défaut')
      return
    }

    setDepartments(prev => prev.filter(dept => dept.id !== id))
    toast.success(`Département "${dept?.name}" supprimé`)
  }

  const getDepartmentByName = (name: string) => {
    return departments.find(dept => dept.name.toLowerCase() === name.toLowerCase())
  }

  const getDepartmentColor = (name: string) => {
    const dept = getDepartmentByName(name)
    return dept?.color || '#6B7280'
  }

  return (
    <DepartmentsContext.Provider value={{
      departments,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      getDepartmentByName,
      getDepartmentColor
    }}>
      {children}
    </DepartmentsContext.Provider>
  )
}

export function useDepartments() {
  const context = useContext(DepartmentsContext)
  if (context === undefined) {
    throw new Error('useDepartments must be used within a DepartmentsProvider')
  }
  return context
}
