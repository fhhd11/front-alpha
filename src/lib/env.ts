// Environment variables configuration for client-side
// This ensures variables are available in production builds

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_BACKEND_URL: string
}

// Get environment variables with fallbacks
export const getEnvConfig = (): EnvConfig => {
  // Try to get from process.env first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  // If not available, try to get from window (for runtime config)
  if (typeof window !== 'undefined') {
    const runtimeConfig = (window as any).__NEXT_DATA__?.runtimeConfig
    
    return {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || runtimeConfig?.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey || runtimeConfig?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      NEXT_PUBLIC_BACKEND_URL: backendUrl || runtimeConfig?.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    }
  }

  // Server-side fallback
  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'https://placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey || 'placeholder-key',
    NEXT_PUBLIC_BACKEND_URL: backendUrl || 'http://localhost:8000',
  }
}

// Export individual values for convenience
export const envConfig = getEnvConfig()
export const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const backendUrl = envConfig.NEXT_PUBLIC_BACKEND_URL
