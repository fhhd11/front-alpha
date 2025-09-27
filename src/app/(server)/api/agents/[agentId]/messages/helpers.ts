import { MESSAGE_TYPE } from '@/types'
import { LettaMessageUnion } from '@letta-ai/letta-client/api'

export function filterMessages(messages: LettaMessageUnion[]) {
  const MESSAGE_TYPES_TO_HIDE = [MESSAGE_TYPE.SYSTEM_MESSAGE]
  const SERVICE_EVENT_TYPES = ['login', 'logout', 'status', 'heartbeat']

  return (
    messages
      .filter((message: { messageType?: string; message_type?: string; content?: string; [key: string]: unknown }) => {
        try {
          // Handle both messageType and message_type formats
          const messageType = message.messageType || message.message_type
          
          if (
            messageType === MESSAGE_TYPE.USER_MESSAGE &&
            typeof message.content === 'string'
          ) {
            const parsed = JSON.parse(message.content)
            
            // Hide service event messages (login, logout, status, heartbeat)
            if (parsed?.type && SERVICE_EVENT_TYPES.includes(parsed.type)) {
              return false
            }
          }
        } catch {
          // Keep message if content is not valid JSON
          const messageType = message.messageType || message.message_type
          if (
            MESSAGE_TYPES_TO_HIDE.includes(messageType as MESSAGE_TYPE)
          ) {
            return false
          }
          return true
        }
        // Keep non-service event, valid JSON messages
        const messageType = message.messageType || message.message_type
        if (MESSAGE_TYPES_TO_HIDE.includes(messageType as MESSAGE_TYPE)) {
          return false
        }
        return true
      })
      // @ts-expect-error - date property may not exist on all message types
      .sort((a, b) => a.date - b.date)
  )
}