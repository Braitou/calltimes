'use client'

import { X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectFile } from '@/lib/services/files'
import { ProjectFolder } from '@/lib/services/folders'
import { CallSheet } from '@/lib/services/call-sheets'
import { FileThumbnail } from './FileThumbnail'
import { getFileType, formatBytes } from '@/lib/utils/file-helpers'
import { cn } from '@/lib/utils'

interface FolderWindowProps {
  folder: ProjectFolder
  files: ProjectFile[]
  callSheets: CallSheet[]
  position: { x: number; y: number }
  onClose: () => void
  onFileClick: (file: ProjectFile | CallSheet) => void
}

/**
 * Fenêtre flottante qui s'affiche au double-click sur un dossier
 * Affiche le contenu du dossier (fichiers + call sheets)
 */
export function FolderWindow({
  folder,
  files,
  callSheets,
  position,
  onClose,
  onFileClick
}: FolderWindowProps) {
  const allItems = [
    ...files.map(f => ({ type: 'file' as const, data: f })),
    ...callSheets.map(cs => ({ type: 'callsheet' as const, data: cs }))
  ]

  return (
    <div
      className="absolute bg-[#111] border border-[#333] rounded-lg shadow-2xl z-50 min-w-[250px] max-w-[300px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#222]">
        <h3 className="font-bold text-sm truncate flex-1">{folder.name}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-[#222]"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {allItems.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            <p>Dossier vide</p>
          </div>
        ) : (
          <div className="space-y-1">
            {allItems.map((item, index) => {
              const isFile = item.type === 'file'
              const file = isFile ? item.data as ProjectFile : null
              const callSheet = !isFile ? item.data as CallSheet : null

              return (
                <div
                  key={index}
                  draggable={isFile} // Seulement les fichiers sont draggables
                  onDragStart={(e) => {
                    if (isFile && file) {
                      // Stocker l'ID du fichier pour le drop
                      e.dataTransfer.setData('text/plain', file.id)
                      e.dataTransfer.setData('application/json', JSON.stringify({ 
                        type: 'file', 
                        id: file.id,
                        fromFolder: true 
                      }))
                      e.dataTransfer.effectAllowed = 'move'
                      
                      // Cloner l'élément pour le drag ghost
                      const target = e.currentTarget as HTMLElement
                      const clone = target.cloneNode(true) as HTMLElement
                      clone.style.opacity = '0.8'
                      clone.style.position = 'absolute'
                      clone.style.top = '-1000px'
                      document.body.appendChild(clone)
                      e.dataTransfer.setDragImage(clone, 50, 20)
                      setTimeout(() => document.body.removeChild(clone), 0)
                      
                      console.log('📤 Dragging file from folder:', file.file_name, file.id)
                    }
                  }}
                  onClick={() => onFileClick(item.data)}
                  className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-md transition-all",
                  "hover:bg-[#222] text-left group cursor-pointer",
                  isFile && "cursor-move"
                  )}
                >
                  {/* Icon/Thumbnail */}
                  {isFile && file ? (
                    <div className="flex-shrink-0">
                      <FileThumbnail
                        type={getFileType(file.mime_type, file.file_name)}
                        className="w-8 h-[42px]"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-8 h-[42px] bg-green-400/20 rounded flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {isFile && file ? file.file_name : callSheet?.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {isFile && file ? (
                        <>
                          {getFileType(file.mime_type, file.file_name).toUpperCase()} • {formatBytes(file.file_size)}
                        </>
                      ) : (
                        'Call Sheet'
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

