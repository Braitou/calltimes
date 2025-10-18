'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { LayoutGrid, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DesktopIcon } from './DesktopIcon'
import { DesktopItem } from '@/types/project-hub'
import { cn } from '@/lib/utils'
import { getSelectionRect, getItemsInSelectionRect } from '@/lib/utils/desktop-helpers'
import { PRIVATE_ZONE_THRESHOLD, adjustPositionAwayFromSeparator } from '@/lib/constants/canvas'

interface DesktopCanvasProps {
  items: DesktopItem[]
  selectedItemIds: Set<string>
  renamingItemId: string | null
  onItemSelect: (ids: Set<string>) => void
  onItemDoubleClick: (item: DesktopItem) => void
  onItemMove: (id: string, x: number, y: number) => void
  onItemRename: (id: string, newName: string) => void
  onCancelRename: () => void
  onUpload: () => void
  onContextMenu: (e: React.MouseEvent, item?: DesktopItem) => void
  onArrange?: () => void
  onDropOnFolder?: (fileId: string, folderId: string) => void
  isReadOnly?: boolean
  role?: 'owner' | 'editor' | 'viewer' | null
  userId?: string | null
  isGuestAccess?: boolean
}

/**
 * Zone centrale avec grille et icônes draggables + sélection multiple
 */
export function DesktopCanvas({
  items,
  selectedItemIds,
  renamingItemId,
  onItemSelect,
  onItemDoubleClick,
  onItemMove,
  onItemRename,
  onCancelRename,
  onUpload,
  onContextMenu,
  onArrange,
  onDropOnFolder,
  isReadOnly = false,
  role = null,
  userId = null,
  isGuestAccess = false
}: DesktopCanvasProps) {
  // Calculer si l'utilisateur peut uploader (owner ou editor)
  const canUpload = role === 'owner' || role === 'editor'
  const desktopRef = useRef<HTMLDivElement>(null)
  const [canvasHeight, setCanvasHeight] = useState(0)
  
  // Calculer la hauteur du canvas pour positionner la ligne de séparation
  useEffect(() => {
    if (desktopRef.current) {
      const updateHeight = () => {
        const height = desktopRef.current?.clientHeight || 0
        setCanvasHeight(height)
      }
      updateHeight()
      window.addEventListener('resize', updateHeight)
      return () => window.removeEventListener('resize', updateHeight)
    }
  }, [])
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Sélection par rectangle
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null)
  const [hasMovedDuringSelection, setHasMovedDuringSelection] = useState(false)

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    // Désactiver drag & drop en lecture seule
    if (isReadOnly) {
      e.preventDefault()
      return
    }
    
    setDraggedItemId(itemId)
    
    // Calculer l'offset pour que l'icône suive le curseur correctement
    const item = items.find(i => i.id === itemId)
    if (item && desktopRef.current) {
      const rect = desktopRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left - item.x,
        y: e.clientY - rect.top - item.y
      })
    }
    
    // Configurer le drag avec l'élément cloné
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      
      // Cloner l'élément pour le drag ghost
      const target = e.currentTarget as HTMLElement
      const clone = target.cloneNode(true) as HTMLElement
      clone.style.opacity = '0.8'
      clone.style.transform = 'scale(1.1)'
      clone.style.position = 'absolute'
      clone.style.top = '-1000px'
      document.body.appendChild(clone)
      
      // Utiliser le clone comme image de drag
      e.dataTransfer.setDragImage(clone, 35, 50)
      
      // Nettoyer après un court délai
      setTimeout(() => document.body.removeChild(clone), 0)
    }
  }, [items, isReadOnly])

  const handleDragEnd = useCallback(() => {
    setDraggedItemId(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    
    if (!desktopRef.current) return
    
    const rect = desktopRef.current.getBoundingClientRect()
    let x = Math.max(0, e.clientX - rect.left - dragOffset.x)
    let y = Math.max(0, e.clientY - rect.top - dragOffset.y)
    
    // Ajuster la position Y pour éviter la ligne de séparation
    y = adjustPositionAwayFromSeparator(y, canvasHeight)
    
    // Vérifier si c'est un drag depuis un dossier
    const dragData = e.dataTransfer.getData('application/json')
    if (dragData) {
      try {
        const data = JSON.parse(dragData)
        if (data.fromFolder && data.type === 'file') {
          // Fichier dragué depuis un dossier → Sortir du dossier
          console.log('📥 Dropping file from folder to canvas:', data.id, { x, y })
          if (onDropOnFolder) {
            // On utilise onDropOnFolder avec null pour sortir du dossier
            onDropOnFolder(data.id, 'ROOT')
          }
          return
        }
      } catch (err) {
        console.error('Error parsing drag data:', err)
      }
    }
    
    // Sinon, c'est un drag normal sur le canvas
    if (draggedItemId) {
      onItemMove(draggedItemId, x, y)
      setDraggedItemId(null)
    }
  }, [draggedItemId, dragOffset, onItemMove, onDropOnFolder, canvasHeight])

  // Sélection par rectangle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Ignorer si c'est un clic droit
    if (e.button !== 0) return
    
    // Ignorer si on clique sur une icône
    const target = e.target as HTMLElement
    if (target.closest('[data-desktop-icon]')) return
    
    if (!desktopRef.current) return
    
    const rect = desktopRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + desktopRef.current.scrollLeft
    const y = e.clientY - rect.top + desktopRef.current.scrollTop
    
    setIsSelecting(true)
    setSelectionStart({ x, y })
    setSelectionEnd({ x, y })
    setHasMovedDuringSelection(false)
    
    // Désélectionner tout si pas de Ctrl
    if (!e.ctrlKey && !e.metaKey) {
      onItemSelect(new Set())
    }
  }, [onItemSelect])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !desktopRef.current) return
    
    const rect = desktopRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left + desktopRef.current.scrollLeft
    const y = e.clientY - rect.top + desktopRef.current.scrollTop
    
    // Marquer qu'on a bougé (pour différencier d'un simple clic)
    if (Math.abs(x - selectionStart.x) > 3 || Math.abs(y - selectionStart.y) > 3) {
      setHasMovedDuringSelection(true)
    }
    
    setSelectionEnd({ x, y })
    
    // Calculer les items dans le rectangle
    const selectionRect = getSelectionRect(selectionStart, { x, y })
    const itemsInRect = getItemsInSelectionRect(items, selectionRect)
    
    // Mettre à jour la sélection
    const newSelection = new Set(itemsInRect)
    onItemSelect(newSelection)
  }, [isSelecting, selectionStart, items, onItemSelect])

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [])

  // Écouter les événements de souris au niveau global
  useEffect(() => {
    if (isSelecting) {
      window.addEventListener('mousemove', handleMouseMove as any)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isSelecting, handleMouseMove, handleMouseUp])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Ne pas désélectionner si on vient de faire une sélection par drag
    if (hasMovedDuringSelection) {
      setHasMovedDuringSelection(false)
      return
    }
    
    // Désélectionner si on clique sur le canvas (pas sur une icône)
    const target = e.target as HTMLElement
    if (!target.closest('[data-desktop-icon]')) {
      onItemSelect(new Set())
    }
  }, [onItemSelect, hasMovedDuringSelection])

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    // Context menu sur le canvas vide
    const target = e.target as HTMLElement
    if (!target.closest('[data-desktop-icon]')) {
      e.preventDefault()
      onContextMenu(e)
    }
  }, [onContextMenu])

  // Calculer le rectangle de sélection pour l'affichage
  const selectionRect = selectionStart && selectionEnd 
    ? getSelectionRect(selectionStart, selectionEnd)
    : null

  // Calculer la position Y de la ligne de séparation
  const separatorY = canvasHeight * PRIVATE_ZONE_THRESHOLD
  
  // Filtrer les items pour les guests (cacher la zone privée)
  const visibleItems = isGuestAccess 
    ? items.filter(item => item.y < separatorY)
    : items

  return (
    <main className="bg-[#0a0a0a] overflow-auto custom-scrollbar relative">
      {/* Header sticky */}
      <div className="sticky top-0 bg-[#0a0a0a] border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-base font-bold uppercase tracking-wide">Documents</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid
          </Button>
          {canUpload && (
            <Button
              size="sm"
              onClick={onUpload}
              className="bg-green-400 hover:bg-green-500 text-black font-bold"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>
      
      {/* Desktop Grid avec background */}
      <div
        ref={desktopRef}
        data-canvas="true"
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onMouseDown={handleMouseDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "desktop-grid relative",
          "p-8 min-h-[calc(100vh-170px)]",
          isSelecting && "cursor-crosshair"
        )}
      >
        {/* Zone privée - Background différent (seulement visible pour org members) */}
        {!isGuestAccess && canvasHeight > 0 && (
          <div
            className="absolute left-0 right-0 bg-[#111111] pointer-events-none"
            style={{
              top: `${separatorY}px`,
              bottom: 0
            }}
          />
        )}
        
        {/* Ligne de séparation (seulement visible pour org members) */}
        {!isGuestAccess && canvasHeight > 0 && (
          <>
            {/* Ligne de séparation principale */}
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-gray-700 pointer-events-none z-10"
              style={{ top: `${separatorY}px` }}
            />
            
            {/* Badge "Zone Privée" */}
            <div
              className="absolute left-8 bg-red-500/20 border border-red-500/50 rounded-md px-3 py-1.5 flex items-center gap-2 pointer-events-none z-10"
              style={{ top: `${separatorY + 16}px` }}
            >
              <span className="text-red-400 text-sm">🔒</span>
              <span className="text-red-400 text-xs font-bold uppercase tracking-wide">Zone Privée</span>
              <span className="text-red-400/60 text-xs">Visible uniquement par votre organisation</span>
            </div>
          </>
        )}
        
        {/* Afficher les icônes (filtrées pour les guests) */}
        {visibleItems.map((item) => (
          <DesktopIcon
            key={item.id}
            item={item}
            isSelected={selectedItemIds.has(item.id)}
            isDragging={item.id === draggedItemId}
            isRenaming={item.id === renamingItemId}
            onSelect={(id, ctrlKey) => {
              if (ctrlKey) {
                // Ctrl/Cmd+Clic : Toggle (ajouter/retirer)
                const newSelection = new Set(selectedItemIds)
                if (newSelection.has(id)) {
                  newSelection.delete(id)
                } else {
                  newSelection.add(id)
                }
                onItemSelect(newSelection)
              } else {
                // Clic simple : Sélection unique (comme Windows)
                onItemSelect(new Set([id]))
              }
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDoubleClick={onItemDoubleClick}
            onContextMenu={onContextMenu}
            onRename={onItemRename}
            onCancelRename={onCancelRename}
            onDropOnFolder={onDropOnFolder}
          />
        ))}
        
        {/* Rectangle de sélection */}
        {selectionRect && isSelecting && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
            style={{
              left: `${selectionRect.x}px`,
              top: `${selectionRect.y}px`,
              width: `${selectionRect.width}px`,
              height: `${selectionRect.height}px`
            }}
          />
        )}
        
        {/* Message si vide */}
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucun fichier pour l'instant</p>
              <p className="text-sm">Uploadez vos premiers documents ou créez un call sheet</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
