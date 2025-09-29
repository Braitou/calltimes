import { z } from 'zod'

// Regex pour valider le format HH:MM (24h)
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

export const scheduleItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  time: z.string()
    .refine((time) => {
      if (!time) return true // Permettre temps vide
      return timeRegex.test(time)
    }, {
      message: 'Format invalide. Utilisez HH:MM (ex: 08:30, 13:45)'
    }),
  order: z.number().optional()
})

export const scheduleSchema = z.array(scheduleItemSchema)

export type ScheduleItem = z.infer<typeof scheduleItemSchema>
export type Schedule = z.infer<typeof scheduleSchema>

// Fonction helper pour valider un horaire isolé
export function validateTime(time: string): { isValid: boolean; error?: string } {
  try {
    const result = z.string().refine((t) => !t || timeRegex.test(t), {
      message: 'Format invalide. Utilisez HH:MM (ex: 08:30, 13:45)'
    }).parse(time)
    
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message }
    }
    return { isValid: false, error: 'Erreur de validation' }
  }
}

// Fonction helper pour formater un horaire
export function formatTime(time: string): string {
  if (!time) return ''
  
  // Si déjà au bon format, retourner tel quel
  if (timeRegex.test(time)) return time
  
  // Essayer de corriger des formats courants
  const cleaned = time.replace(/[^\d:]/g, '')
  
  // Si format H:MM, ajouter un 0 devant
  if (/^\d:[0-5]\d$/.test(cleaned)) {
    return '0' + cleaned
  }
  
  // Si format HH.MM ou HHMM, convertir en HH:MM
  if (/^\d{3,4}$/.test(cleaned)) {
    const hours = cleaned.slice(0, -2).padStart(2, '0')
    const minutes = cleaned.slice(-2)
    return `${hours}:${minutes}`
  }
  
  return time // Retourner tel quel si on ne peut pas corriger
}
