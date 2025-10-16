'use client'

import { useState, useRef, useEffect } from 'react'
import { Folder, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DesktopItem } from '@/types/project-hub'
import { FileThumbnail } from './FileThumbnail'
import { getFileType } from '@/lib/utils/file-helpers'

interface DesktopIconProps {
  item: DesktopItem
  isSelected: boolean
  isDragging: boolean
  isRenaming: boolean
  onSelect: (id: string, ctrlKey: boolean) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onDoubleClick: (item: DesktopItem) => void
  onContextMenu: (e: React.MouseEvent, item: DesktopItem) => void
  onRename: (id: string, newName: string) => void
  onCancelRename: () => void
  onDropOnFolder?: (fileId: string, folderId: string) => void
}

/**
 * Icône draggable sur le desktop canvas
 * Peut représenter un dossier, un fichier ou un call sheet
 */
export function DesktopIcon({
  item,
  isSelected,
  isDragging,
  isRenaming,
  onSelect,
  onDragStart,
  onDragEnd,
  onDoubleClick,
  onContextMenu,
  onRename,
  onCancelRename,
  onDropOnFolder
}: DesktopIconProps) {
  const [editValue, setEditValue] = useState(item.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDropTarget, setIsDropTarget] = useState(false)
  
  // Focus l'input quand on passe en mode renommage
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isRenaming) {
      // Passer l'état de Ctrl/Cmd pour gérer la sélection multiple
      onSelect(item.id, e.ctrlKey || e.metaKey)
    }
  }
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isRenaming) {
      onDoubleClick(item)
    }
  }
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isRenaming) {
      onContextMenu(e, item)
    }
  }
  
  const handleRenameSubmit = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== item.name) {
      onRename(item.id, trimmedValue)
    } else {
      onCancelRename()
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditValue(item.name)
      onCancelRename()
    }
  }

  // Drag & Drop sur dossier
  const handleDragOver = (e: React.DragEvent) => {
    if (item.type === 'folder' && onDropOnFolder) {
      e.preventDefault()
      e.stopPropagation()
      setIsDropTarget(true)
      console.log('📂 DragOver folder:', item.name)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (item.type === 'folder') {
      e.stopPropagation()
      setIsDropTarget(false)
      console.log('📂 DragLeave folder:', item.name)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('📂 DROP on:', item.name, 'type:', item.type)
    
    if (item.type === 'folder' && onDropOnFolder) {
      // Récupérer l'ID du fichier draggé depuis le dataTransfer
      const fileId = e.dataTransfer.getData('text/plain')
      console.log('📂 FileId from dataTransfer:', fileId, 'Target folder ID:', item.id)
      
      if (fileId && fileId !== item.id) {
        console.log('📂 Calling onDropOnFolder with:', { fileId, folderId: item.id })
        onDropOnFolder(fileId, item.id)
      } else {
        console.log('📂 Drop ignored:', fileId ? 'Same item' : 'No fileId')
      }
      setIsDropTarget(false)
    } else {
      console.log('📂 Drop ignored: Not a folder or no handler')
    }
  }

  return (
    <div
      data-desktop-icon
      draggable
      onDragStart={(e) => {
        // Stocker l'ID pour le drop
        e.dataTransfer.setData('text/plain', item.id)
        onDragStart(e, item.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute',
        left: `${item.x}px`,
        top: `${item.y}px`,
        opacity: isDragging ? 0.5 : 1
      }}
      className={cn(
        "w-[70px] cursor-move select-none transition-transform hover:scale-105",
        isDragging && "cursor-grabbing z-50"
      )}
    >
      <div className={cn(
        "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
        "hover:bg-green-400/10",
        isSelected && "bg-green-400/15 ring-1 ring-green-400",
        isDropTarget && "bg-blue-400/20 ring-2 ring-blue-400 scale-110"
      )}>
        
        {/* Icon ou Thumbnail */}
        {item.type === 'folder' ? (
          // Dossier - TOUJOURS JAUNE
          <div className="relative">
            <Folder className="w-10 h-10 text-yellow-500 drop-shadow-lg fill-yellow-500/20" />
            {/* Nombre de fichiers dans le dossier */}
            {'files_count' in item.data && item.data.files_count !== undefined && (
              <div className="absolute -bottom-1 -right-1 bg-black/80 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {item.data.files_count}
              </div>
            )}
          </div>
        ) : item.type === 'callsheet' ? (
          // Call Sheet - Icône verte
          <div className="relative">
            <div className="w-10 h-10 bg-green-400/20 rounded-md flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-400 drop-shadow-lg" />
            </div>
          </div>
        ) : (
          // Fichier - Miniature stylisée
          <FileThumbnail 
            type={getFileType(
              'mime_type' in item.data ? item.data.mime_type : 'application/octet-stream',
              item.name
            )} 
          />
        )}
        
        {/* Label - Éditable en mode renommage */}
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "text-xs font-medium text-center leading-tight w-full",
              "bg-white text-black px-1 py-0.5 rounded",
              "border-2 border-blue-500 outline-none"
            )}
          />
        ) : (
          <span className={cn(
            "text-xs font-medium text-center leading-tight max-w-full truncate",
            "text-white text-shadow"
          )}>
            {item.name}
          </span>
        )}
        
        {/* Compteur pour dossiers */}
        {item.type === 'folder' && 'files_count' in item.data && (
          <span className="text-[10px] text-green-400 font-semibold">
            {item.data.files_count} fichier{item.data.files_count > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

