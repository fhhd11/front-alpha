'use client'

import { Letta } from '@letta-ai/letta-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers/supabase-provider'

export const getUseAgentStateKey = (agentId: string) => ['agentState', agentId]

export function useAgentState(agentId: string) {
  const { session } = useSupabase()

  return useQuery<Letta.AgentState>({
    queryKey: getUseAgentStateKey(agentId),
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }


      const response = await fetch(`/api/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('useAgentState API Error:', response.status, errorText)
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    },
    refetchInterval: 3000,
    enabled: !!agentId && !!session?.access_token
  })
}

export function useModifyAgent(agentId: string) {
  const { session } = useSupabase()

  return useMutation({
    mutationFn: async (newData: { name: string }) => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }


      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(newData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('useModifyAgent API Error:', response.status, errorText)
        throw new Error(`Failed to modify agent: ${response.status}`)
      }
      return response.json()
    }
  })
}

// Remove useDeleteAgent as agents should not be deleted in this system
