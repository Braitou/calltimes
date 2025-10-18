/**
 * Utilitaires pour calculer les positions des fichiers/dossiers sur le canvas
 */

export interface CanvasItem {
  x: number
  y: number
}

const GRID_SIZE = 120 // Espacement entre les éléments
const ICON_SIZE = 100 // Taille approximative d'une icône
const CANVAS_PADDING = 20 // Marge depuis les bords

/**
 * Trouve la prochaine position libre sur le canvas
 * Arrange les éléments en grille de gauche à droite, haut en bas
 */
export function findNextFreePosition(existingItems: CanvasItem[]): { x: number; y: number } {
  if (existingItems.length === 0) {
    return { x: CANVAS_PADDING, y: CANVAS_PADDING }
  }

  // Trouver la position la plus à droite et la plus en bas
  const maxX = Math.max(...existingItems.map(item => item.x))
  const maxY = Math.max(...existingItems.map(item => item.y))

  // Essayer d'abord de placer à droite du dernier élément
  const nextX = maxX + GRID_SIZE
  const nextY = maxY

  // Vérifier si cette position est libre (pas de chevauchement)
  const isFree = !existingItems.some(item => 
    Math.abs(item.x - nextX) < ICON_SIZE && Math.abs(item.y - nextY) < ICON_SIZE
  )

  if (isFree) {
    return { x: nextX, y: nextY }
  }

  // Si pas de place à droite, aller à la ligne suivante
  return { x: CANVAS_PADDING, y: maxY + GRID_SIZE }
}

/**
 * Trouve une position libre pour un nouveau dossier
 * Évite les chevauchements avec les éléments existants
 */
export function findFreePositionForFolder(existingItems: CanvasItem[]): { x: number; y: number } {
  if (existingItems.length === 0) {
    return { x: CANVAS_PADDING, y: CANVAS_PADDING }
  }

  // Parcourir la grille pour trouver un espace libre
  const maxX = Math.max(...existingItems.map(item => item.x), 0)
  const maxY = Math.max(...existingItems.map(item => item.y), 0)

  // Limites du canvas (on suppose 1200x800 pour l'instant)
  const canvasWidth = 1200
  const canvasHeight = 800

  for (let y = CANVAS_PADDING; y < canvasHeight; y += GRID_SIZE) {
    for (let x = CANVAS_PADDING; x < canvasWidth; x += GRID_SIZE) {
      // Vérifier si cette position est libre
      const isFree = !existingItems.some(item => 
        Math.abs(item.x - x) < ICON_SIZE && Math.abs(item.y - y) < ICON_SIZE
      )

      if (isFree) {
        return { x, y }
      }
    }
  }

  // Si aucune position libre trouvée, placer en bas à droite
  return { x: maxX + GRID_SIZE, y: maxY + GRID_SIZE }
}

/**
 * Calcule la position pour un fichier uploadé
 * Place à la suite des autres fichiers
 */
export function calculateUploadPosition(existingItems: CanvasItem[], index: number = 0): { x: number; y: number } {
  const basePosition = findNextFreePosition(existingItems)
  
  // Si plusieurs fichiers uploadés en même temps, les décaler légèrement
  return {
    x: basePosition.x + (index * 20),
    y: basePosition.y + (index * 20)
  }
}


