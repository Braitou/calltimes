/**
 * CALL TIMES - useUserAccess Hook
 * 
 * Hook React pour gérer les permissions utilisateur dans les composants
 */

import { useState, useEffect } from 'react'
import { getUserAccessType, canAccessProject, canModifyProject, canAccessCallSheets, type UserAccess } from '@/lib/services/user-access'

export function useUserAccess() {
  const [access, setAccess] = useState<UserAccess>({ type: 'none' })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAccess()
  }, [])

  const loadAccess = async () => {
    setIsLoading(true)
    try {
      const userAccess = await getUserAccessType()
      setAccess(userAccess)
    } catch (error) {
      console.error('Error loading user access:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    access,
    isLoading,
    isOrgMember: access.type === 'org_member',
    isProjectGuest: access.type === 'project_guest',
    isOwner: access.role === 'owner',
    organizationId: access.organizationId,
    projectIds: access.projectIds,
    reload: loadAccess
  }
}

export function useProjectAccess(projectId: string) {
  const [canAccess, setCanAccess] = useState(false)
  const [canModify, setCanModify] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuestAccess, setIsGuestAccess] = useState(false)
  const [role, setRole] = useState<'owner' | 'editor' | 'viewer' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadProjectAccess()
  }, [projectId])

  const loadProjectAccess = async () => {
    setIsLoading(true)
    try {
      // Vérifier d'abord si un token guest existe pour ce projet
      const guestToken = localStorage.getItem(`guest_token_${projectId}`)
      const guestRole = localStorage.getItem(`guest_role_${projectId}`) as 'editor' | 'viewer' | null
      
      if (guestToken) {
        // Accès invité : permissions selon le rôle
        const effectiveRole = guestRole || 'viewer'
        setCanAccess(true)
        setCanModify(effectiveRole === 'editor') // Editors peuvent modifier
        setIsGuestAccess(true)
        setRole(effectiveRole)
        setUserId(null)
        console.log('🎫 Guest access detected:', { role: effectiveRole, canModify: effectiveRole === 'editor' })
      } else {
        // Accès authentifié normal - récupérer le rôle exact
        const { createSupabaseClient } = await import('@/lib/supabase/client')
        const supabase = createSupabaseClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setCanAccess(false)
          setCanModify(false)
          setRole(null)
          setUserId(null)
          return
        }

        setUserId(user.id)

        // Récupérer le rôle depuis project_members
        const { data: memberData } = await supabase
          .from('project_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .single()

        if (memberData) {
          setCanAccess(true)
          setRole(memberData.role as 'owner' | 'editor' | 'viewer')
          setCanModify(memberData.role === 'owner' || memberData.role === 'editor')
          
          // Détecter si c'est un service account guest (email pattern: guest-*@call-times.internal)
          const isServiceAccount = user.email?.includes('@call-times.internal') || false
          
          // Les editors/viewers sont toujours des guests (externes à l'organisation)
          // Même s'ils ont un service account authentifié
          const isGuest = memberData.role !== 'owner' || isServiceAccount
          setIsGuestAccess(isGuest)
          
          console.log('🎫 User access type:', { 
            role: memberData.role, 
            isServiceAccount, 
            isGuestAccess: isGuest,
            email: user.email 
          })
        } else {
          // Vérifier si membre de l'organisation (accès automatique en tant qu'owner)
          const { data: projectData } = await supabase
            .from('projects')
            .select('organization_id')
            .eq('id', projectId)
            .single()

          if (projectData) {
            const { data: membership } = await supabase
              .from('memberships')
              .select('id')
              .eq('organization_id', projectData.organization_id)
              .eq('user_id', user.id)
              .single()

            if (membership) {
              setCanAccess(true)
              setCanModify(true)
              setRole('owner')
              setIsGuestAccess(false)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading project access:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    canAccess,
    canModify,
    isReadOnly: canAccess && !canModify,
    isGuestAccess,
    role,
    userId,
    isOwner: role === 'owner',
    isEditor: role === 'editor',
    isViewer: role === 'viewer',
    isLoading
  }
}

export function useCallSheetsAccess() {
  const [canAccess, setCanAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAccess()
  }, [])

  const loadAccess = async () => {
    setIsLoading(true)
    try {
      const access = await canAccessCallSheets()
      setCanAccess(access)
    } catch (error) {
      console.error('Error loading call sheets access:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    canAccessCallSheets: canAccess,
    isLoading
  }
}

/**
 * Hook pour vérifier si l'utilisateur peut modifier/supprimer un fichier ou dossier
 * Règles:
 * - Owner: peut tout modifier/supprimer
 * - Editor: peut modifier/supprimer seulement ses propres fichiers
 * - Viewer: ne peut rien modifier/supprimer
 */
export function useFileOwnership(userId: string | null, uploadedBy: string | null, role: 'owner' | 'editor' | 'viewer' | null) {
  const canModify = role === 'owner' || (role === 'editor' && userId === uploadedBy)
  const canDelete = role === 'owner' || (role === 'editor' && userId === uploadedBy)
  
  return {
    canModify,
    canDelete,
    isOwner: userId === uploadedBy
  }
}

