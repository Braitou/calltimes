'use server'

import { sendCallSheetEmail, type CallSheetEmailData } from '@/lib/services/email'

/**
 * Server Action pour envoyer la call sheet par email
 */
export async function sendCallSheetEmailAction(data: CallSheetEmailData) {
  try {
    const result = await sendCallSheetEmail(data)
    return result
  } catch (error: any) {
    console.error('❌ Erreur server action email:', error)
    return {
      success: false,
      error: error.message || 'Erreur serveur lors de l\'envoi',
      recipients: data.recipients.map(r => ({
        email: r.email,
        status: 'failed' as const,
        error: error.message
      }))
    }
  }
}
