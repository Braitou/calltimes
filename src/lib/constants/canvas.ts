/**
 * Constantes pour le canvas du Project Hub
 */

// Seuil de la zone privée (60% partagé, 40% privé)
export const PRIVATE_ZONE_THRESHOLD = 0.6

// Hauteur minimale estimée du canvas (pour les calculs)
export const CANVAS_MIN_HEIGHT = 800

// Marge de sécurité autour de la ligne de séparation (en pixels)
export const SEPARATOR_MARGIN = 80

/**
 * Vérifie si un item est dans la zone privée
 */
export function isInPrivateZone(y: number, canvasHeight: number = CANVAS_MIN_HEIGHT): boolean {
  const threshold = canvasHeight * PRIVATE_ZONE_THRESHOLD
  return y >= threshold
}

/**
 * Ajuste la position Y pour éviter la zone de la ligne de séparation
 * Si trop proche de la ligne, snap vers le haut ou le bas
 */
export function adjustPositionAwayFromSeparator(
  y: number, 
  canvasHeight: number = CANVAS_MIN_HEIGHT
): number {
  const separatorY = canvasHeight * PRIVATE_ZONE_THRESHOLD
  const distanceFromSeparator = Math.abs(y - separatorY)
  
  // Si trop proche de la ligne (dans la marge)
  if (distanceFromSeparator < SEPARATOR_MARGIN) {
    // Snap vers le haut (zone partagée) si au-dessus de la ligne
    if (y < separatorY) {
      const snappedY = separatorY - SEPARATOR_MARGIN - 20 // +20px de marge supplémentaire
      return Math.max(0, snappedY) // Ne pas aller en négatif
    }
    // Snap vers le bas (zone privée) si en-dessous de la ligne
    else {
      return separatorY + SEPARATOR_MARGIN + 20 // +20px de marge supplémentaire
    }
  }
  
  return y
}

