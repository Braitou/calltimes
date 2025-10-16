'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { ToolsSidebar } from '@/components/project-hub/ToolsSidebar'
import { DesktopCanvas } from '@/components/project-hub/DesktopCanvas'
import { PreviewSidebar } from '@/components/project-hub/PreviewSidebar'
import { FolderWindow } from '@/components/project-hub/FolderWindow'
import { ContextMenu } from '@/components/project-hub/ContextMenu'
import { FileUploadModal } from '@/components/project-hub/FileUploadModal'
import { FilePreviewModal } from '@/components/project-hub/FilePreviewModal'
import { DesktopItem, TeamMember } from '@/types/project-hub'
import { ProjectFolder } from '@/lib/services/folders'
import { getProjectById } from '@/lib/services/projects'
import { getProjectFiles, updateFilePosition, moveFileToFolder, deleteFile } from '@/lib/services/files'
import { getFoldersByProject, createFolder, updateFolderPosition, deleteFolder } from '@/lib/services/folders'
import { getCallSheetsByProject, deleteCallSheet } from '@/lib/services/call-sheets'
import { getProjectMembers, inviteProjectMember } from '@/lib/services/invitations'
import { formatBytes, getInitials, calculateInitialPosition } from '@/lib/utils/file-helpers'
import { autoArrangeItems, downloadMultipleFiles } from '@/lib/utils/desktop-helpers'

/**
 * Page Project Hub - Desktop Canvas avec drag & drop
 * Layout 3 colonnes : Tools | Canvas | Preview
 */
export default function ProjectHubPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  // État
  const [project, setProject] = useState<any>(null)
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([])
  const [allFiles, setAllFiles] = useState<any[]>([]) // TOUS les fichiers du projet (dans dossiers ET racine)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set()) // Changé pour sélection multiple
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openFolder, setOpenFolder] = useState<{ folder: ProjectFolder; position: { x: number; y: number } } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ item?: DesktopItem; position: { x: number; y: number } } | null>(null) // item optionnel pour canvas
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [fullscreenPreview, setFullscreenPreview] = useState<DesktopItem | null>(null)
  const [selectionBox, setSelectionBox] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null)
  
  // Debounce pour la sauvegarde des positions
  const savePositionTimeoutRef = useRef<NodeJS.Timeout>()

  // Charger les données du projet
  useEffect(() => {
    loadProjectData()
  }, [projectId])

  // Écouter la touche Suppr pour supprimer les éléments sélectionnés
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedItemIds.size > 0) {
        handleDeleteMultiple()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItemIds, desktopItems])

  const loadProjectData = async () => {
    setIsLoading(true)
    try {
      // 1. Charger le projet
      const projectResult = await getProjectById(projectId)
      if (!projectResult.success || !projectResult.data) {
        toast.error('Projet introuvable')
        router.push('/projects')
        return
      }
      setProject(projectResult.data)

      // 2. Charger les dossiers
      const foldersResult = await getFoldersByProject(projectId)
      const folders = foldersResult.success ? foldersResult.data : []

      // 3. Charger TOUS les fichiers du projet (pas juste la racine)
      const allFilesResult = await getProjectFiles(projectId) // Pas de filtre de folder_id
      const allProjectFiles = allFilesResult.success ? allFilesResult.data : []
      
      // Stocker TOUS les fichiers dans l'état
      setAllFiles(allProjectFiles)
      
      // Séparer les fichiers à la racine (folder_id = null) des autres
      const rootFiles = allProjectFiles.filter(f => !f.folder_id)
      
      // Compter les fichiers dans chaque dossier
      const filesCountByFolder: { [folderId: string]: number } = {}
      allProjectFiles.forEach(file => {
        if (file.folder_id) {
          filesCountByFolder[file.folder_id] = (filesCountByFolder[file.folder_id] || 0) + 1
        }
      })

      // 4. Charger les call sheets
      const callSheetsResult = await getCallSheetsByProject(projectId)
      const callSheets = callSheetsResult.success ? callSheetsResult.data : []

      // 5. Charger les membres
      const membersResult = await getProjectMembers(projectId)
      const mappedMembers: TeamMember[] = membersResult.success 
        ? membersResult.data.map(m => ({
            id: m.id,
            name: m.user_id || m.email,
            email: m.email,
            initials: getInitials(m.user_id || m.email),
            role: m.role as 'owner' | 'editor' | 'viewer'
          }))
        : []
      setTeamMembers(mappedMembers)

      // 6. Convertir en DesktopItems
      const items: DesktopItem[] = [
        // Dossiers (avec compteur de fichiers)
        ...folders.map(folder => ({
          id: folder.id,
          type: 'folder' as const,
          name: folder.name,
          x: folder.position_x,
          y: folder.position_y,
          data: { ...folder, files_count: filesCountByFolder[folder.id] || 0 }
        })),
        // Fichiers (seulement ceux à la racine pour le canvas)
        ...rootFiles.map(file => ({
          id: file.id,
          type: 'file' as const,
          name: file.file_name,
          x: file.position_x,
          y: file.position_y,
          data: file
        })),
        // Call Sheets
        ...callSheets.map(cs => ({
          id: cs.id,
          type: 'callsheet' as const,
          name: cs.title,
          x: 0, // TODO: ajouter position_x/y aux call_sheets
          y: 0,
          data: cs
        }))
      ]

      // Positionner les items sans position
      const existingPositions = items.filter(i => i.x !== 0 || i.y !== 0).map(i => ({ x: i.x, y: i.y }))
      items.forEach((item, index) => {
        if (item.x === 0 && item.y === 0) {
          const pos = calculateInitialPosition(existingPositions, 50, 50, 100)
          item.x = pos.x
          item.y = pos.y
          existingPositions.push(pos)
        }
      })

      setDesktopItems(items)
      console.log('✅ Projet chargé:', {
        project: projectResult.data.name,
        folders: folders.length,
        files: allProjectFiles.length,
        callSheets: callSheets.length,
        members: mappedMembers.length
      })
    } catch (error) {
      console.error('Error loading project data:', error)
      toast.error('Erreur lors du chargement du projet')
    } finally {
      setIsLoading(false)
    }
  }

  // Sauvegarder la position d'un item (debounced)
  const saveItemPosition = useCallback(async (itemId: string, x: number, y: number) => {
    const item = desktopItems.find(i => i.id === itemId)
    if (!item) return

    try {
      if (item.type === 'folder') {
        await updateFolderPosition(itemId, x, y)
      } else if (item.type === 'file') {
        await updateFilePosition(itemId, x, y)
      }
      // TODO: Ajouter position pour call sheets
    } catch (error) {
      console.error('Error saving position:', error)
      toast.error('Erreur lors de la sauvegarde de la position')
    }
  }, [desktopItems])

  // Handler pour le déplacement d'un item
  const handleItemMove = useCallback((itemId: string, x: number, y: number) => {
    // Mise à jour optimiste
    setDesktopItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, x, y } : item
    ))

    // Debounce la sauvegarde (500ms)
    if (savePositionTimeoutRef.current) {
      clearTimeout(savePositionTimeoutRef.current)
    }
    savePositionTimeoutRef.current = setTimeout(() => {
      saveItemPosition(itemId, x, y)
    }, 500)
  }, [saveItemPosition])

  // Handler pour double-click (ouvrir dossier ou fichier)
  const handleItemDoubleClick = useCallback((item: DesktopItem) => {
    if (item.type === 'folder') {
      // Ouvrir fenêtre flottante avec contenu du dossier
      setOpenFolder({
        folder: item.data as ProjectFolder,
        position: { x: item.x + 80, y: item.y }
      })
    } else if (item.type === 'callsheet') {
      // Ouvrir l'éditeur de call sheet
      router.push(`/call-sheets/${item.id}/edit`)
    } else if (item.type === 'file') {
      // Ouvrir le fichier en plein écran
      setFullscreenPreview(item)
    }
  }, [router])

  // Handler pour context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, item?: DesktopItem) => {
    setContextMenu({
      item,
      position: { x: e.clientX, y: e.clientY }
    })
  }, [])
  
  // Handler pour renommage
  const handleRename = useCallback(async (itemId: string, newName: string) => {
    const item = desktopItems.find(i => i.id === itemId)
    if (!item) return

    try {
      if (item.type === 'folder') {
        const { updateFolder } = await import('@/lib/services/folders')
        const result = await updateFolder(itemId, { name: newName })
        if (result.success) {
          setDesktopItems(prev => prev.map(i =>
            i.id === itemId ? { ...i, name: newName } : i
          ))
          toast.success('Dossier renommé')
        } else {
          toast.error(result.error || 'Erreur lors du renommage')
        }
      } else if (item.type === 'file') {
        // TODO: Implémenter renommage fichier
        toast.info('Renommage de fichiers (à implémenter)')
      }
    } catch (error) {
      console.error('Error renaming item:', error)
      toast.error('Erreur lors du renommage')
    } finally {
      setRenamingItemId(null)
    }
  }, [desktopItems])

  // Actions de la Tools Sidebar
  const handleNewCallSheet = () => {
    router.push(`/projects/${projectId}/call-sheets/new`)
  }

  const handleManageTeam = () => {
    toast.info('Gestion d\'équipe (à implémenter)')
  }

  const handleAddContacts = () => {
    toast.info('Ajout de contacts (à implémenter)')
  }

  const handleSendEmail = () => {
    toast.info('Envoi d\'email (à implémenter)')
  }

  const handleUploadFiles = () => {
    setShowUploadModal(true)
  }

  const handleUploadComplete = (uploadedFiles: any[]) => {
    toast.success(`${uploadedFiles.length} fichier${uploadedFiles.length > 1 ? 's' : ''} uploadé${uploadedFiles.length > 1 ? 's' : ''}`)
    // Recharger les données du projet pour afficher les nouveaux fichiers
    loadProjectData()
  }

  const handleNewFolder = async () => {
    try {
      // Créer immédiatement avec un nom par défaut
      const result = await createFolder({
        project_id: projectId,
        name: 'Nouveau dossier',
        position_x: 50,
        position_y: 50
      })

      if (result.success && result.data) {
        const newItem: DesktopItem = {
          id: result.data.id,
          type: 'folder',
          name: result.data.name,
          x: result.data.position_x,
          y: result.data.position_y,
          data: { ...result.data, files_count: 0 }
        }
        setDesktopItems(prev => [...prev, newItem])
        
        // Mettre immédiatement en mode renommage
        setRenamingItemId(result.data.id)
        setSelectedItemId(result.data.id)
        
        toast.success('Dossier créé')
      } else {
        toast.error(result.error || 'Erreur lors de la création du dossier')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Erreur lors de la création du dossier')
    }
  }

  // Drag & Drop fichier vers dossier (ou vers la racine)
  const handleDropOnFolder = async (fileId: string, folderId: string) => {
    console.log('🎯 handleDropOnFolder called:', { fileId, folderId })
    
    try {
      // Cas spécial : sortir du dossier (vers la racine)
      if (folderId === 'ROOT') {
        console.log('📤 Extracting file from folder to root')
        const fileInFolder = allFiles.find(f => f.id === fileId)
        
        if (!fileInFolder) {
          console.error('❌ File not found in allFiles')
          toast.error('Fichier introuvable')
          return
        }
        
        const result = await moveFileToFolder(fileId, null) // null = racine
        
        if (result.success) {
          console.log('✅ File extracted to root')
          toast.success(`"${fileInFolder.file_name}" sorti du dossier`)
          
          // Fermer la fenêtre du dossier si ouverte
          setOpenFolder(null)
          
          // Recharger les données
          await loadProjectData()
        } else {
          console.error('❌ moveFileToFolder failed:', result.error)
          toast.error(result.error || 'Erreur lors du déplacement')
        }
        return
      }
      
      // Cas normal : déplacer vers un dossier
      const file = desktopItems.find(i => i.id === fileId)
      const folder = desktopItems.find(i => i.id === folderId)
      
      console.log('📁 File & Folder found:', { 
        file: file ? { id: file.id, type: file.type, name: file.name } : null,
        folder: folder ? { id: folder.id, type: folder.type, name: folder.name } : null
      })
      
      if (!file || !folder) {
        console.error('❌ File or folder not found')
        toast.error('Fichier ou dossier introuvable')
        return
      }
      
      if (file.type !== 'file') {
        console.error('❌ Dragged item is not a file:', file.type)
        toast.error('Seuls les fichiers peuvent être déplacés dans un dossier')
        return
      }
      
      if (folder.type !== 'folder') {
        console.error('❌ Drop target is not a folder:', folder.type)
        toast.error('La cible doit être un dossier')
        return
      }

      console.log('📤 Calling moveFileToFolder...')
      const result = await moveFileToFolder(fileId, folderId)
      
      if (result.success) {
        console.log('✅ File moved successfully')
        toast.success(`"${file.name}" déplacé dans "${folder.name}"`)
        
        // Recharger toutes les données du projet pour mettre à jour le compteur et le contenu du dossier
        await loadProjectData()
      } else {
        console.error('❌ moveFileToFolder failed:', result.error)
        toast.error(result.error || 'Erreur lors du déplacement')
      }
    } catch (error) {
      console.error('❌ Error moving file to folder:', error)
      toast.error('Erreur lors du déplacement')
    }
  }

  // Actions de la Preview Sidebar
  const handleDownload = (item: DesktopItem) => {
    if (item.type === 'file' && 'public_url' in item.data) {
      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = item.data.public_url
      link.download = item.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Téléchargement de "${item.name}" démarré`)
    } else {
      toast.info(`Téléchargement de "${item.name}" (à implémenter)`)
    }
  }

  const handleOpenFullscreen = (item: DesktopItem) => {
    setFullscreenPreview(item)
  }

  const handleDelete = async (item: DesktopItem) => {
    if (!confirm(`Supprimer "${item.name}" ?`)) return

    try {
      if (item.type === 'folder') {
        const result = await deleteFolder(item.id)
        if (result.success) {
          setDesktopItems(prev => prev.filter(i => i.id !== item.id))
          setSelectedItemId(null)
          toast.success('Dossier supprimé')
        } else {
          toast.error(result.error || 'Erreur lors de la suppression')
        }
      } else if (item.type === 'file') {
        const result = await deleteFile(item.id)
        if (result.success) {
          setDesktopItems(prev => prev.filter(i => i.id !== item.id))
          setSelectedItemId(null)
          setFullscreenPreview(null) // Fermer la preview si ouverte
          toast.success('Fichier supprimé')
        } else {
          toast.error(result.error || 'Erreur lors de la suppression')
        }
      } else if (item.type === 'callsheet') {
        const result = await deleteCallSheet(item.id)
        if (result.success) {
          setDesktopItems(prev => prev.filter(i => i.id !== item.id))
          setSelectedItemIds(new Set())
          toast.success('Call Sheet supprimé')
        } else {
          toast.error(result.error || 'Erreur lors de la suppression')
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Suppression multiple
  const handleDeleteMultiple = async () => {
    const itemsToDelete = Array.from(selectedItemIds).map(id => desktopItems.find(i => i.id === id)).filter(Boolean) as DesktopItem[]
    
    if (itemsToDelete.length === 0) return
    
    const message = itemsToDelete.length === 1 
      ? `Supprimer "${itemsToDelete[0].name}" ?`
      : `Supprimer ${itemsToDelete.length} éléments ?`
    
    if (!confirm(message)) return

    try {
      const results = await Promise.all(
        itemsToDelete.map(async (item) => {
          if (item.type === 'folder') {
            return await deleteFolder(item.id)
          } else if (item.type === 'file') {
            return await deleteFile(item.id)
          } else if (item.type === 'callsheet') {
            return await deleteCallSheet(item.id)
          }
          return { success: false }
        })
      )

      const successCount = results.filter(r => r.success).length
      
      if (successCount > 0) {
        setDesktopItems(prev => prev.filter(i => !selectedItemIds.has(i.id)))
        setSelectedItemIds(new Set())
        setFullscreenPreview(null)
        toast.success(`${successCount} élément(s) supprimé(s)`)
      }
      
      const failCount = results.length - successCount
      if (failCount > 0) {
        toast.error(`${failCount} élément(s) n'ont pas pu être supprimés`)
      }
    } catch (error) {
      console.error('Error deleting multiple items:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Ranger automatiquement les éléments
  const handleArrangeItems = async () => {
    try {
      const arrangedItems = autoArrangeItems(desktopItems, 120, 50, 50, 6)
      
      // Sauvegarder les nouvelles positions
      const updatePromises = arrangedItems.map(async (item) => {
        if (item.type === 'folder') {
          return await updateFolderPosition(item.id, item.x, item.y)
        } else if (item.type === 'file') {
          return await updateFilePosition(item.id, item.x, item.y)
        }
        return { success: true }
      })
      
      await Promise.all(updatePromises)
      
      // Mettre à jour l'affichage
      setDesktopItems(arrangedItems)
      toast.success('Éléments rangés automatiquement')
    } catch (error) {
      console.error('Error arranging items:', error)
      toast.error('Erreur lors du rangement')
    }
  }

  // Télécharger plusieurs fichiers
  const handleDownloadMultiple = async () => {
    const itemsToDownload = Array.from(selectedItemIds)
      .map(id => desktopItems.find(i => i.id === id))
      .filter(item => item && item.type === 'file') as DesktopItem[]
    
    if (itemsToDownload.length === 0) {
      toast.info('Aucun fichier sélectionné')
      return
    }
    
    try {
      await downloadMultipleFiles(itemsToDownload)
      toast.success(`${itemsToDownload.length} fichier(s) téléchargé(s)`)
    } catch (error) {
      console.error('Error downloading files:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  const handleInviteMember = async (email: string) => {
    try {
      const result = await inviteProjectMember(projectId, email, 'editor')
      if (result.success) {
        toast.success(`Invitation envoyée à ${email}`)
        // Recharger les membres
        const membersResult = await getProjectMembers(projectId)
        if (membersResult.success) {
          const mappedMembers: TeamMember[] = membersResult.data.map(m => ({
            id: m.id,
            name: m.user_id || m.email,
            email: m.email,
            initials: getInitials(m.user_id || m.email),
            role: m.role as 'owner' | 'editor' | 'viewer'
          }))
          setTeamMembers(mappedMembers)
        }
      } else {
        toast.error(result.error || 'Erreur lors de l\'invitation')
      }
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error('Erreur lors de l\'invitation')
    }
  }

  // Calculer les stats du projet
  const projectStats = {
    filesCount: desktopItems.filter(i => i.type === 'file').length,
    totalSize: formatBytes(
      desktopItems
        .filter(i => i.type === 'file')
        .reduce((sum, item) => sum + ('file_size' in item.data ? item.data.file_size : 0), 0)
    ),
    membersCount: teamMembers.length
  }

  const selectedItem = selectedItemIds.size === 1 
    ? desktopItems.find(i => i.id === Array.from(selectedItemIds)[0]) || null
    : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
          <p className="text-white text-lg font-medium">Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  // Mock user pour le header
  const mockUser = {
    full_name: 'Simon Bandiera',
    email: 'simon@call-times.app'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header avec navigation */}
      <Header user={mockUser} />
      
      {/* Breadcrumb / Project Header */}
      <div className="bg-[#0a0a0a] border-b border-gray-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/projects')}
            className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Projets
          </button>
          <span className="text-gray-600">/</span>
          <span className="text-white font-semibold">{project.name}</span>
        </div>
      </div>
      
      {/* Layout 3 colonnes */}
      <div className="grid grid-cols-[280px_1fr_380px] h-[calc(100vh-73px-49px)] overflow-hidden">
        {/* Sidebar gauche - Tools */}
        <ToolsSidebar
          projectId={projectId}
          projectName={project.name}
          projectStats={projectStats}
          onNewCallSheet={handleNewCallSheet}
          onManageTeam={handleManageTeam}
          onAddContacts={handleAddContacts}
          onSendEmail={handleSendEmail}
          onUploadFiles={handleUploadFiles}
          onNewFolder={handleNewFolder}
        />

        {/* Zone centrale - Desktop Canvas */}
        <div className="relative">
          <DesktopCanvas
            items={desktopItems}
            selectedItemIds={selectedItemIds}
            renamingItemId={renamingItemId}
            onItemSelect={(ids) => {
              setSelectedItemIds(ids)
              setOpenFolder(null) // Fermer le dossier ouvert
              setContextMenu(null) // Fermer le context menu
            }}
            onItemDoubleClick={handleItemDoubleClick}
            onItemMove={handleItemMove}
            onItemRename={handleRename}
            onCancelRename={() => setRenamingItemId(null)}
            onUpload={handleUploadFiles}
            onContextMenu={handleContextMenu}
            onArrange={handleArrangeItems}
            onDropOnFolder={handleDropOnFolder}
          />

          {/* Fenêtre flottante du dossier ouvert */}
          {openFolder && (
            <FolderWindow
              folder={openFolder.folder}
              files={allFiles.filter(f => f.folder_id === openFolder.folder.id)}
              callSheets={[]} // TODO: Ajouter support des call sheets dans dossiers
              position={openFolder.position}
              onClose={() => setOpenFolder(null)}
              onFileClick={(file) => {
                if ('title' in file) {
                  // Call Sheet
                  router.push(`/call-sheets/${file.id}/edit`)
                } else {
                  // Fichier - créer un DesktopItem temporaire pour la preview
                  const tempItem: DesktopItem = {
                    id: file.id,
                    type: 'file',
                    name: file.file_name,
                    x: 0,
                    y: 0,
                    data: file
                  }
                  setFullscreenPreview(tempItem)
                }
                setOpenFolder(null)
              }}
            />
          )}

          {/* Context Menu */}
          {contextMenu && (
            <ContextMenu
              item={contextMenu.item}
              position={contextMenu.position}
              onClose={() => setContextMenu(null)}
              onRename={contextMenu.item ? () => {
                setRenamingItemId(contextMenu.item!.id)
                setContextMenu(null)
              } : undefined}
              onDelete={contextMenu.item ? () => {
                handleDelete(contextMenu.item!)
                setContextMenu(null)
              } : undefined}
              onOpen={contextMenu.item && contextMenu.item.type === 'folder' ? () => {
                handleItemDoubleClick(contextMenu.item!)
                setContextMenu(null)
              } : undefined}
              onDownload={contextMenu.item && contextMenu.item.type === 'file' ? () => {
                handleDownload(contextMenu.item!)
                setContextMenu(null)
              } : undefined}
              onArrange={!contextMenu.item ? () => {
                handleArrangeItems()
                setContextMenu(null)
              } : undefined}
            />
          )}

          {/* Modal Upload */}
          {showUploadModal && (
            <FileUploadModal
              projectId={projectId}
              onClose={() => setShowUploadModal(false)}
              onUploadComplete={handleUploadComplete}
            />
          )}
        </div>

        {/* Sidebar droite - Preview */}
        <PreviewSidebar
          selectedItem={selectedItem}
          teamMembers={teamMembers}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onInviteMember={handleInviteMember}
          onOpenFullscreen={handleOpenFullscreen}
        />
      </div>

      {/* Modal Preview Plein Écran */}
      {fullscreenPreview && (
        <FilePreviewModal
          item={fullscreenPreview}
          allItems={desktopItems}
          onClose={() => setFullscreenPreview(null)}
          onDownload={handleDownload}
          onNavigate={(item) => setFullscreenPreview(item)}
        />
      )}
    </div>
  )
}
