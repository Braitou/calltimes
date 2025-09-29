'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

interface UseAutoSaveResult {
  status: SaveStatus
  lastSaved: Date | null
  save: () => Promise<void>
  error: string | null
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 500,
  enabled = true
}: UseAutoSaveOptions<T>): UseAutoSaveResult {
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout>()
  const dataRef = useRef<T>(data)
  const isFirstRender = useRef(true)

  // Fonction de sauvegarde manuelle
  const save = useCallback(async () => {
    if (!enabled) return

    try {
      setStatus('saving')
      setError(null)
      
      await onSave(dataRef.current)
      
      setStatus('saved')
      setLastSaved(new Date())
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde')
      console.error('Auto-save error:', err)
    }
  }, [onSave, enabled])

  // Auto-save avec debounce
  useEffect(() => {
    // Skip sur le premier rendu pour éviter une sauvegarde immédiate
    if (isFirstRender.current) {
      isFirstRender.current = false
      dataRef.current = data
      return
    }

    // Skip si pas activé
    if (!enabled) return

    // Marquer comme non sauvegardé
    setStatus('unsaved')
    setError(null)
    dataRef.current = data

    // Clear le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Programmer la sauvegarde
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, save, debounceMs, enabled])

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    status,
    lastSaved,
    save,
    error
  }
}
