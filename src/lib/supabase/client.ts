import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo_key'

// For development without Supabase setup, we'll create a mock client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  Supabase not configured - using demo mode')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Client for use in client components
export function createSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
