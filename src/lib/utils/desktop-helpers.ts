/**
 * Helpers pour le Desktop Canvas
 */

import { DesktopItem } from '@/types/project-hub'

/**
 * Vérifie si un point est dans un rectangle
 */
export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/**
 * Vérifie si deux rectangles se chevauchent
 */
export function doRectsOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  )
}

/**
 * Calcule le rectangle de sélection à partir de deux points
 */
export function getSelectionRect(
  start: { x: number; y: number },
  end: { x: number; y: number }
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  }
}

/**
 * Trouve tous les items dans un rectangle de sélection
 */
export function getItemsInSelectionRect(
  items: DesktopItem[],
  selectionRect: { x: number; y: number; width: number; height: number }
): string[] {
  const ICON_WIDTH = 80
  const ICON_HEIGHT = 100

  return items
    .filter(item => {
      const itemRect = {
        x: item.x,
        y: item.y,
        width: ICON_WIDTH,
        height: ICON_HEIGHT
      }
      return doRectsOverlap(selectionRect, itemRect)
    })
    .map(item => item.id)
}

/**
 * Range automatiquement les items en grille
 * Ordre : Call Sheets → Dossiers → Fichiers
 */
export function autoArrangeItems(
  items: DesktopItem[],
  gridSize: number = 120,
  startX: number = 50,
  startY: number = 50,
  columns: number = 6
): DesktopItem[] {
  // Trier par type puis par nom
  const sortedItems = [...items].sort((a, b) => {
    // Ordre de priorité
    const typeOrder = { callsheet: 0, folder: 1, file: 2 }
    const orderA = typeOrder[a.type]
    const orderB = typeOrder[b.type]
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // Même type : tri alphabétique
    return a.name.localeCompare(b.name)
  })

  // Placer en grille
  return sortedItems.map((item, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    
    return {
      ...item,
      x: startX + col * gridSize,
      y: startY + row * gridSize
    }
  })
}

/**
 * Télécharge plusieurs fichiers
 */
export async function downloadMultipleFiles(items: DesktopItem[]): Promise<void> {
  const files = items.filter(item => item.type === 'file' && 'public_url' in item.data)
  
  for (const item of files) {
    const link = document.createElement('a')
    link.href = (item.data as any).public_url
    link.download = item.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Petit délai entre chaque téléchargement
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

