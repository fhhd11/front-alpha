import { useQuery } from '@tanstack/react-query'
import { Letta } from '@letta-ai/letta-client'
import { useSupabase } from '@/components/providers/supabase-provider'

export const USE_AGENT_ARCHIVAL_MEMORY_KEY = ['agentArchivalMemory']

export function useAgentArchivalMemory(agentId: string) {
  const { session } = useSupabase()

  return useQuery<Letta.Passage[]>({
    queryKey: [...USE_AGENT_ARCHIVAL_MEMORY_KEY, agentId],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }


      const response = await fetch(`/api/agents/${agentId}/archival_memory`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('useAgentArchivalMemory API Error:', response.status, errorText)
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    },
    refetchInterval: 3000,
    enabled: !!agentId && !!session?.access_token
  })
}
