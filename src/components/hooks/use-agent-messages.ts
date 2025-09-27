import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers/supabase-provider'

export const getAgentMessagesQueryKey = (agentId: string) => [
  'agentMessages',
  agentId
]

export function useAgentMessages(agentId: string) {
  const { session } = useSupabase()

  return useQuery({
    queryKey: getAgentMessagesQueryKey(agentId),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }


      const response = await fetch(`/api/agents/${agentId}/messages`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!response.ok) {
        // const errorText = await response.text()
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!agentId && !!session?.access_token
  })
}
