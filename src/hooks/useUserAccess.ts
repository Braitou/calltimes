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

  useEffect(() => {
    loadProjectAccess()
  }, [projectId])

  const loadProjectAccess = async () => {
    setIsLoading(true)
    try {
      // Vérifier d'abord si un token guest existe pour ce projet
      const guestToken = localStorage.getItem(`guest_token_${projectId}`)
      
      if (guestToken) {
        // Accès invité : lecture seule automatique
        setCanAccess(true)
        setCanModify(false)
        setIsGuestAccess(true)
      } else {
        // Accès authentifié normal
        const [access, modify] = await Promise.all([
          canAccessProject(projectId),
          canModifyProject(projectId)
        ])
        setCanAccess(access)
        setCanModify(modify)
        setIsGuestAccess(false)
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

