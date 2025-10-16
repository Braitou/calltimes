import { createSupabaseClient } from '@/lib/supabase/client'

/**
 * Upload a file to Supabase Storage
 */
export async function uploadProjectFile(
  projectId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const supabase = createSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${projectId}/${timestamp}_${sanitizedFileName}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL (or signed URL for private files)
    const { data: { publicUrl } } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath)

    // Insert file metadata into database
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_path: filePath,
        file_type: getFileType(file.type),
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Cleanup: delete uploaded file if DB insert fails
      await supabase.storage.from('project-files').remove([filePath])
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      data: {
        ...fileRecord,
        public_url: publicUrl
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get all files for a project
 */
export async function getProjectFiles(projectId: string) {
  try {
    const supabase = createSupabaseClient()

    // Debug: check auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔐 Auth status in getProjectFiles:', { user: user?.email, authError })

    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching files:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }
  }
}

/**
 * Delete a file from storage and database
 */
export async function deleteProjectFile(fileId: string, filePath: string) {
  try {
    const supabase = createSupabaseClient()

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([filePath])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue anyway to delete DB record
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      console.error('Database deletion error:', dbError)
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get a signed URL for downloading a file
 */
export async function getFileDownloadUrl(filePath: string, expiresIn: number = 3600) {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return { success: false, error: error.message, url: null }
    }

    return { success: true, url: data.signedUrl }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: null
    }
  }
}

/**
 * Get file type category from MIME type
 */
function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentation'
  return 'other'
}

/**
 * Get storage usage for a project
 */
export async function getProjectStorageUsage(projectId: string) {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('project_files')
      .select('file_size')
      .eq('project_id', projectId)

    if (error) {
      console.error('Error calculating storage:', error)
      return { success: false, totalBytes: 0, error: error.message }
    }

    const totalBytes = data.reduce((sum, file) => sum + (file.file_size || 0), 0)

    return { success: true, totalBytes }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      totalBytes: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

