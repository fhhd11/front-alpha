import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers/supabase-provider'
import { getAgentMessagesQueryKey } from './use-agent-messages'
import { toast } from 'sonner'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { UIMessage } from 'ai'

export function useResetAgentMessages(agentId: string, setMessages?: UseChatHelpers<UIMessage>['setMessages']) {
  const { session } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      // Dispatch reset start event
      window.dispatchEvent(new CustomEvent('chat-reset-start'))

      const response = await fetch(`/api/agents/${agentId}/reset-messages`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Reset messages API Error:', response.status, errorText)
        throw new Error(`Failed to reset messages: ${response.status}`)
      }

      return response.json()
    },
    onSuccess: () => {
      // Clear the chat UI immediately
      if (setMessages) {
        setMessages([])
      }

      // Invalidate and refetch agent messages to clear the chat
      queryClient.invalidateQueries({
        queryKey: getAgentMessagesQueryKey(agentId)
      })
      
      // Also invalidate agent state
      queryClient.invalidateQueries({
        queryKey: ['agentState', agentId]
      })

      // Dispatch reset end event after a short delay to ensure queries are invalidated
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('chat-reset-end'))
      }, 100)

      toast.success('Chat history has been reset successfully')
    },
    onError: (error) => {
      console.error('Error resetting messages:', error)
      // Dispatch reset end event even on error
      window.dispatchEvent(new CustomEvent('chat-reset-end'))
      toast.error('Failed to reset chat history. Please try again.')
    }
  })
}
