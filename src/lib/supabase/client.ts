import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key'

// For development without Supabase setup, we'll create a mock client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  Supabase not configured - using demo mode')
}

// Client pour les composants client (avec gestion cookies automatique)
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// Client for use in client components
export function createSupabaseClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
