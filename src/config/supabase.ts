import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug logging for production
if (typeof window !== 'undefined') {
  console.log('Supabase Config:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    isPlaceholder: supabaseUrl.includes('placeholder')
  })
}

// Client-side Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
