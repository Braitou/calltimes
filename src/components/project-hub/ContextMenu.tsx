'use client'

import { useEffect, useRef } from 'react'
import { Edit2, Trash2, FolderOpen, Download, Grid3x3 } from 'lucide-react'
import { DesktopItem } from '@/types/project-hub'
import { cn } from '@/lib/utils'
import { useFileOwnership } from '@/hooks/useUserAccess'

interface ContextMenuProps {
  item?: DesktopItem // Optionnel pour le canvas
  position: { x: number; y: number }
  onClose: () => void
  onRename?: () => void
  onDelete?: () => void
  onOpen?: () => void
  onDownload?: () => void
  onArrange?: () => void // Nouvelle action pour ranger
  isReadOnly?: boolean
  role?: 'owner' | 'editor' | 'viewer' | null
  userId?: string | null
}

/**
 * Menu contextuel (right-click) pour les items du desktop
 */
export function ContextMenu({
  item,
  position,
  onClose,
  onRename,
  onDelete,
  onOpen,
  onDownload,
  onArrange,
  isReadOnly = false,
  role = null,
  userId = null
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Vérifier si l'utilisateur peut modifier/supprimer cet item
  const uploadedBy = item?.type === 'file' ? item.data?.uploaded_by : item?.type === 'folder' ? item.data?.created_by : null
  const { canModify, canDelete } = useFileOwnership(userId, uploadedBy, role)

  // Fermer au click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const menuItems = []

  // Si pas d'item = menu du canvas
  if (!item) {
    if (onArrange && !isReadOnly) {
      menuItems.push({
        icon: Grid3x3,
        label: 'Ranger les éléments',
        onClick: onArrange
      })
    }
  } else {
    // Menu pour un item spécifique
    // Ouvrir (dossier ou fichier)
    if (onOpen) {
      menuItems.push({
        icon: FolderOpen,
        label: item.type === 'folder' ? 'Ouvrir' : 'Voir',
        onClick: onOpen
      })
    }

    // Renommer - Owners peuvent tout renommer, Editors seulement leurs propres fichiers
    if (onRename && canModify) {
      menuItems.push({
        icon: Edit2,
        label: 'Renommer',
        onClick: onRename
      })
    }

    // Télécharger (fichiers uniquement) - Tout le monde peut télécharger
    if (item.type === 'file' && onDownload) {
      menuItems.push({
        icon: Download,
        label: 'Télécharger',
        onClick: onDownload
      })
    }

    // Séparateur + Supprimer - Owners peuvent tout supprimer, Editors seulement leurs propres fichiers
    if (onDelete && canDelete) {
      menuItems.push({
        separator: true
      })

      menuItems.push({
        icon: Trash2,
        label: 'Supprimer',
        onClick: onDelete,
        danger: true
      })
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-[#111] border border-[#333] rounded-lg shadow-2xl py-1 min-w-[180px] z-[100]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item, index) => {
        if ('separator' in item && item.separator) {
          return <div key={index} className="h-px bg-[#222] my-1" />
        }

        const Icon = item.icon!
        return (
          <button
            key={index}
            onClick={() => {
              item.onClick!()
              onClose()
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left",
              item.danger
                ? "text-red-400 hover:bg-red-900/20"
                : "text-white hover:bg-[#222]"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

