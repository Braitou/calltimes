/**
 * CALL TIMES - User Access Type Detection
 * 
 * Détecte si un utilisateur est :
 * - org_member : Membre d'une organisation (accès complet)
 * - project_guest : Invité sur un projet spécifique (accès restreint)
 */

import { supabase } from '@/lib/supabase/client'

export type UserAccessType = 'org_member' | 'project_guest' | 'none'

export interface UserAccess {
  type: UserAccessType
  organizationId?: string
  projectIds?: string[]
  role?: 'owner' | 'member' | 'viewer'
}

/**
 * Récupère le type d'accès d'un utilisateur
 */
export async function getUserAccessType(userId?: string): Promise<UserAccess> {
  try {
    // 1. Récupérer l'utilisateur actuel si pas fourni
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { type: 'none' }
      }
      currentUserId = user.id
    }

    // 2. Vérifier si l'utilisateur est membre d'une organisation
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', currentUserId)
      .single()

    if (!membershipError && membership) {
      // L'utilisateur est membre d'une organisation → accès complet
      return {
        type: 'org_member',
        organizationId: membership.organization_id,
        role: membership.role as 'owner' | 'member'
      }
    }

    // 3. Sinon, vérifier si l'utilisateur est invité sur des projets
    const { data: projectAccess, error: projectError } = await supabase
      .from('project_members')
      .select('project_id, role')
      .eq('user_id', currentUserId)

    if (!projectError && projectAccess && projectAccess.length > 0) {
      // L'utilisateur est invité sur des projets → accès restreint
      return {
        type: 'project_guest',
        projectIds: projectAccess.map(p => p.project_id),
        role: 'viewer' // Les invités projet sont toujours viewers
      }
    }

    // 4. Aucun accès trouvé
    return { type: 'none' }
  } catch (error) {
    console.error('Error getting user access type:', error)
    return { type: 'none' }
  }
}

/**
 * Vérifie si l'utilisateur a accès à un projet spécifique
 */
export async function canAccessProject(projectId: string, userId?: string): Promise<boolean> {
  try {
    const access = await getUserAccessType(userId)

    // Membre org → accès à tous les projets de son org
    if (access.type === 'org_member') {
      // Vérifier que le projet appartient à son organisation
      const { data: project } = await supabase
        .from('projects')
        .select('organization_id')
        .eq('id', projectId)
        .single()

      return project?.organization_id === access.organizationId
    }

    // Guest → accès seulement aux projets sur lesquels il est invité
    if (access.type === 'project_guest') {
      return access.projectIds?.includes(projectId) || false
    }

    return false
  } catch (error) {
    console.error('Error checking project access:', error)
    return false
  }
}

/**
 * Vérifie si l'utilisateur peut modifier un projet (upload, delete, etc.)
 */
export async function canModifyProject(projectId: string, userId?: string): Promise<boolean> {
  try {
    const access = await getUserAccessType(userId)

    // Seuls les membres org peuvent modifier
    if (access.type === 'org_member') {
      return await canAccessProject(projectId, userId)
    }

    // Les guests ne peuvent jamais modifier
    return false
  } catch (error) {
    console.error('Error checking modify permissions:', error)
    return false
  }
}

/**
 * Vérifie si l'utilisateur peut voir les call sheets
 */
export async function canAccessCallSheets(userId?: string): Promise<boolean> {
  try {
    const access = await getUserAccessType(userId)

    // Seuls les membres org peuvent voir les call sheets
    return access.type === 'org_member'
  } catch (error) {
    console.error('Error checking call sheets access:', error)
    return false
  }
}

/**
 * Récupère tous les projets accessibles par l'utilisateur
 */
export async function getAccessibleProjects(userId?: string): Promise<string[]> {
  try {
    const access = await getUserAccessType(userId)

    if (access.type === 'org_member') {
      // Tous les projets de l'organisation
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', access.organizationId!)

      return projects?.map(p => p.id) || []
    }

    if (access.type === 'project_guest') {
      // Seulement les projets invités
      return access.projectIds || []
    }

    return []
  } catch (error) {
    console.error('Error getting accessible projects:', error)
    return []
  }
}

/**
 * Vérifie si l'utilisateur est owner de son organisation
 */
export async function isOrganizationOwner(userId?: string): Promise<boolean> {
  try {
    const access = await getUserAccessType(userId)
    return access.type === 'org_member' && access.role === 'owner'
  } catch (error) {
    console.error('Error checking organization owner:', error)
    return false
  }
}

