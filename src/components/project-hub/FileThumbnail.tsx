import { FileType } from '@/types/project-hub'
import { cn } from '@/lib/utils'

interface FileThumbnailProps {
  type: FileType
  className?: string
}

/**
 * Miniature stylisée pour les différents types de fichiers
 * Reproduit le design du mockup avec des effets CSS
 */
export function FileThumbnail({ type, className }: FileThumbnailProps) {
  const baseClasses = "w-10 h-[52px] rounded-sm relative shadow-lg"
  
  if (type === 'pdf') {
    return (
      <div className={cn(
        baseClasses,
        "bg-gradient-to-br from-white to-gray-100 border border-gray-200",
        className
      )}>
        {/* Effet lignes de texte */}
        <div className="absolute inset-2 rounded-sm opacity-30"
             style={{
               background: 'repeating-linear-gradient(0deg, #f97316 0px, #f97316 2px, transparent 2px, transparent 6px)'
             }} />
      </div>
    )
  }
  
  if (type === 'spreadsheet') {
    return (
      <div className={cn(
        baseClasses,
        "bg-gradient-to-br from-white to-blue-50 border border-blue-200",
        className
      )}>
        {/* Effet grille */}
        <div className="absolute inset-2 opacity-20"
             style={{
               background: `
                 repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 8px),
                 repeating-linear-gradient(0deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 8px)
               `
             }} />
      </div>
    )
  }
  
  if (type === 'image') {
    return (
      <div className={cn(
        baseClasses,
        "bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 overflow-hidden",
        className
      )}>
        {/* Effet photo abstrait - cercle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 opacity-40" />
        {/* Effet dégradé bas */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-tr from-purple-500 to-transparent opacity-20" />
      </div>
    )
  }
  
  if (type === 'document') {
    return (
      <div className={cn(
        baseClasses,
        "bg-gradient-to-br from-white to-slate-50 border border-slate-200",
        className
      )}>
        {/* Effet lignes de texte */}
        <div className="absolute inset-2 rounded-sm opacity-20"
             style={{
               background: 'repeating-linear-gradient(0deg, #64748b 0px, #64748b 1px, transparent 1px, transparent 5px)'
             }} />
      </div>
    )
  }
  
  if (type === 'video') {
    return (
      <div className={cn(
        baseClasses,
        "bg-gradient-to-br from-black to-gray-800 border border-gray-600 flex items-center justify-center",
        className
      )}>
        {/* Play icon */}
        <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent opacity-60" />
      </div>
    )
  }
  
  // Type 'other' - fichier générique
  return (
    <div className={cn(
      baseClasses,
      "bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center",
      className
    )}>
      <div className="text-gray-500 text-xs font-bold">?</div>
    </div>
  )
}

