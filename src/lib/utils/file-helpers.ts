import { FileType } from '@/types/project-hub'

/**
 * Détermine le type de fichier à partir du mime type
 */
export function getFileType(mimeType: string, fileName: string): FileType {
  // Images
  if (mimeType.startsWith('image/')) return 'image'
  
  // PDF
  if (mimeType === 'application/pdf') return 'pdf'
  
  // Vidéos
  if (mimeType.startsWith('video/')) return 'video'
  
  // Excel / Spreadsheets
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.csv')
  ) {
    return 'spreadsheet'
  }
  
  // Word / Documents
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.txt')
  ) {
    return 'document'
  }
  
  return 'other'
}

/**
 * Formate la taille d'un fichier en bytes vers une chaîne lisible
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Formate une date relative (ex: "il y a 3 jours")
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins}m`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Génère des initiales à partir d'un nom
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Calcule une position initiale pour un nouvel élément sur le canvas
 * en évitant les collisions avec les éléments existants
 */
export function calculateInitialPosition(
  existingPositions: Array<{ x: number; y: number }>,
  startX: number = 50,
  startY: number = 50,
  gridSize: number = 100
): { x: number; y: number } {
  let x = startX
  let y = startY
  
  // Chercher une position libre
  while (true) {
    const hasCollision = existingPositions.some(
      pos => Math.abs(pos.x - x) < 80 && Math.abs(pos.y - y) < 80
    )
    
    if (!hasCollision) {
      return { x, y }
    }
    
    // Passer à la position suivante (grille)
    x += gridSize
    if (x > 600) {
      x = startX
      y += gridSize
    }
    
    // Éviter une boucle infinie
    if (y > 600) {
      return { x: startX, y: startY }
    }
  }
}

/**
 * Snap une position sur la grille (pour aligner les icônes)
 */
export function snapToGrid(value: number, gridSize: number = 80): number {
  return Math.round(value / gridSize) * gridSize
}

