'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Grid3x3,
  List,
  FileText,
  Image as ImageIcon,
  Film,
  File
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface ProjectFile {
  id: string
  file_name: string
  file_type: string
  file_size: number
  mime_type: string
  file_path: string
  uploaded_by: string
  created_at: string
  folder_path?: string
}

interface CallSheetItem {
  id: string
  title: string
  status: 'draft' | 'sent' | 'archived'
  shoot_date: string | null
  created_at: string
  updated_at: string
}

interface FilesCanvasProps {
  projectId: string
  files: ProjectFile[]
  callSheets?: CallSheetItem[]
  onFileClick?: (file: ProjectFile) => void
  onFileDelete?: (fileId: string) => Promise<void>
  onFileDownload?: (file: ProjectFile) => void
  onCallSheetClick?: (callSheetId: string) => void
  onCallSheetDelete?: (callSheetId: string) => Promise<void>
}

export function FilesCanvas({ 
  projectId, 
  files,
  callSheets = [],
  onFileClick,
  onFileDelete,
  onFileDownload,
  onCallSheetClick,
  onCallSheetDelete
}: FilesCanvasProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Combiner fichiers et call sheets pour la recherche
  const filteredFiles = files.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredCallSheets = callSheets.filter(cs =>
    cs.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-blue-500" />
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />
    if (mimeType.startsWith('video/')) return <Film className="w-6 h-6 text-purple-500" />
    if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) 
      return <FileText className="w-6 h-6 text-blue-600" />
    if (mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) 
      return <FileText className="w-6 h-6 text-green-600" />
    if (mimeType.includes('powerpoint') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) 
      return <FileText className="w-6 h-6 text-orange-500" />
    return <File className="w-6 h-6 text-[#a3a3a3]" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleFileClick = (file: ProjectFile) => {
    setSelectedFile(file)
    if (onFileClick) {
      onFileClick(file)
    } else {
      // Default: open preview for images/PDFs
      if (file.mime_type.startsWith('image/') || file.mime_type === 'application/pdf') {
        setIsPreviewOpen(true)
      }
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#111] border border-[#333] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`px-3 ${viewMode === 'grid' ? 'bg-[#222]' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`px-3 ${viewMode === 'list' ? 'bg-[#222]' : ''}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Files Display */}
        {filteredFiles.length === 0 && filteredCallSheets.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-[#666]">
              <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
              {searchQuery ? (
                <>
                  <p className="text-lg font-medium mb-2">No files found</p>
                  <p className="text-sm">Try a different search term</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">No files yet</p>
                  <p className="text-sm">Upload your first document or create a call sheet</p>
                </>
              )}
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Call Sheets First */}
            {filteredCallSheets.map((callSheet) => (
              <Card
                key={`cs-${callSheet.id}`}
                className="group relative overflow-hidden cursor-pointer transition-all hover:border-call-times-accent hover:shadow-lg hover:scale-105"
                onClick={() => onCallSheetClick?.(callSheet.id)}
              >
                {/* Call Sheet Icon */}
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-call-times-accent/20 to-call-times-accent/5 border-b border-[#222]">
                  <FileText className="w-16 h-16 text-call-times-accent" />
                </div>

                {/* Call Sheet Info */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      callSheet.status === 'draft' ? 'bg-yellow-500/20 text-yellow-500' :
                      callSheet.status === 'sent' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {callSheet.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mb-1">{callSheet.title}</p>
                  <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
                    <span>Call Sheet</span>
                    <span>{formatDate(callSheet.updated_at)}</span>
                  </div>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onCallSheetClick?.(callSheet.id)
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Open Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Delete this call sheet?')) {
                            onCallSheetDelete?.(callSheet.id)
                          }
                        }}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
            
            {/* Then Files */}
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className="group relative overflow-hidden cursor-pointer transition-all hover:border-call-times-accent hover:shadow-lg hover:scale-105"
                onClick={() => handleFileClick(file)}
              >
                {/* File Preview/Icon */}
                <div className="aspect-square flex items-center justify-center bg-[#111] border-b border-[#222]">
                  {file.mime_type.startsWith('image/') ? (
                    <img
                      src={file.file_path}
                      alt={file.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6">
                      {getFileIcon(file.mime_type, file.file_name)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-3">
                  <p className="text-sm font-medium truncate mb-1">{file.file_name}</p>
                  <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>

                {/* Actions (appear on hover) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-8 h-8 p-0 bg-black/80 hover:bg-black border border-[#333]"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleFileClick(file)
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onFileDownload?.(file)
                      }}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          onFileDelete?.(file.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="divide-y divide-[#222]">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
                  onClick={() => handleFileClick(file)}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(file.mime_type, file.file_name)}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.file_name}</p>
                  </div>

                  {/* Size */}
                  <div className="text-sm text-[#a3a3a3] w-24 text-right">
                    {formatFileSize(file.file_size)}
                  </div>

                  {/* Date */}
                  <div className="text-sm text-[#a3a3a3] w-32 text-right">
                    {formatDate(file.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleFileClick(file)
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onFileDownload?.(file)
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            onFileDelete?.(file.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedFile.file_name}</h3>
                  <p className="text-sm text-[#a3a3a3]">
                    {formatFileSize(selectedFile.file_size)} • {formatDate(selectedFile.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFileDownload?.(selectedFile)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="border border-[#333] rounded-lg overflow-hidden bg-[#111]">
                {selectedFile.mime_type.startsWith('image/') ? (
                  <img
                    src={selectedFile.file_path}
                    alt={selectedFile.file_name}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : selectedFile.mime_type === 'application/pdf' ? (
                  <div className="p-8 text-center text-[#666]">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>PDF preview coming soon</p>
                    <Button
                      className="mt-4"
                      onClick={() => onFileDownload?.(selectedFile)}
                    >
                      Download to view
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#666]">
                    <File className="w-16 h-16 mx-auto mb-4" />
                    <p>Preview not available for this file type</p>
                    <Button
                      className="mt-4"
                      onClick={() => onFileDownload?.(selectedFile)}
                    >
                      Download file
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}




