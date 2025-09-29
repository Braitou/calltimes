'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { colorPalette, type Department } from '@/contexts/departments-context'
import { Trash2 } from 'lucide-react'

interface DepartmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department | null // null = nouveau département
  onSave: (name: string, color: string) => void
  onDelete?: (id: string) => void
}

export function DepartmentModal({
  open,
  onOpenChange,
  department,
  onSave,
  onDelete
}: DepartmentModalProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(colorPalette[0])

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      if (department) {
        setName(department.name)
        setSelectedColor(department.color)
      } else {
        setName('')
        setSelectedColor(colorPalette[0])
      }
    }
  }, [open, department])

  const handleSave = () => {
    if (!name.trim()) return
    
    onSave(name.trim(), selectedColor)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!department || !onDelete) return
    
    if (department.isDefault) {
      return // Pas de suppression des départements par défaut
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le département "${department.name}" ?`)) {
      onDelete(department.id)
      onOpenChange(false)
    }
  }

  const isEditing = !!department

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-call-times-gray-dark border-call-times-gray-light">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Modifier le département' : 'Nouveau département'}
          </DialogTitle>
          <DialogDescription className="text-call-times-text-secondary">
            {isEditing 
              ? 'Modifiez le nom et la couleur de ce département.'
              : 'Créez un nouveau département avec un nom et une couleur personnalisés.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nom du département */}
          <div className="space-y-2">
            <Label htmlFor="department-name" className="text-white">
              Nom du département
            </Label>
            <Input
              id="department-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Éclairage, Sécurité..."
              className="bg-call-times-gray-medium border-call-times-gray-light text-white"
              autoFocus
            />
          </div>

          {/* Sélecteur de couleur */}
          <div className="space-y-3">
            <Label className="text-white">Couleur du département</Label>
            
            {/* Couleur sélectionnée */}
            <div className="flex items-center gap-3 p-3 bg-call-times-gray-medium rounded-lg border border-call-times-gray-light">
              <div 
                className="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <div className="text-white font-medium">Couleur sélectionnée</div>
                <div className="text-call-times-text-secondary text-sm">{selectedColor}</div>
              </div>
            </div>

            {/* Palette de couleurs */}
            <div className="grid grid-cols-6 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color 
                      ? 'border-white shadow-lg shadow-white/20' 
                      : 'border-gray-600 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {isEditing && onDelete && !department?.isDefault && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-call-times-gray-light text-call-times-text-secondary hover:bg-call-times-gray-light hover:text-white"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!name.trim()}
              className="bg-call-times-accent text-black hover:bg-call-times-accent/80 font-bold"
            >
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
