'use client'
import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers/supabase-provider'

export const USE_AGENTS_KEY = ['agents']

export function useAgents() {
  const { session } = useSupabase()

  return useQuery({
    queryKey: USE_AGENTS_KEY,
    retry: 0,
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }


      const response = await fetch('/api/agents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!session?.access_token
  })
}
