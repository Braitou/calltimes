import { LucideIcon } from 'lucide-react'
import { ProjectFile } from '@/lib/services/files'
import { ProjectFolder } from '@/lib/services/folders'
import { CallSheet } from '@/lib/services/call-sheets'

/**
 * Types d'éléments affichables sur le desktop canvas
 */
export type DesktopItemType = 'folder' | 'file' | 'callsheet'

/**
 * Types de fichiers pour les miniatures
 */
export type FileType = 'pdf' | 'image' | 'spreadsheet' | 'document' | 'video' | 'other'

/**
 * Couleurs disponibles pour les icônes des tools
 */
export type ToolColor = 'green' | 'blue' | 'purple' | 'red' | 'orange' | 'yellow'

/**
 * Item générique pour le desktop (dossier, fichier ou call sheet)
 */
export interface DesktopItem {
  id: string
  type: DesktopItemType
  name: string
  x: number
  y: number
  data: ProjectFolder | ProjectFile | CallSheet
}

/**
 * Tool dans la sidebar gauche
 */
export interface ToolItem {
  icon: LucideIcon
  label: string
  description: string
  color: ToolColor
  onClick: () => void
}

/**
 * Membre d'équipe affiché dans la preview sidebar
 */
export interface TeamMember {
  id: string
  name: string
  email: string
  initials: string
  role: 'owner' | 'editor' | 'viewer'
  avatar?: string
}

/**
 * Props pour le composant DesktopIcon
 */
export interface DesktopIconProps {
  item: DesktopItem
  isSelected: boolean
  isDragging: boolean
  onSelect: (id: string) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onDoubleClick: (item: DesktopItem) => void
}

/**
 * Props pour le composant FileThumbnail
 */
export interface FileThumbnailProps {
  type: FileType
  className?: string
}

/**
 * Props pour le composant FolderWindow (fenêtre flottante)
 */
export interface FolderWindowProps {
  folder: ProjectFolder
  files: ProjectFile[]
  callSheets: CallSheet[]
  position: { x: number; y: number }
  onClose: () => void
  onFileClick: (file: ProjectFile | CallSheet) => void
}

/**
 * Contexte menu item
 */
export interface ContextMenuItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'danger'
  separator?: boolean
}

