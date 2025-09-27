'use client'

import { Messages } from '@/components/message-area/messages'
import { MessageComposer } from '@/components/message-area/message-composer'
import { useChat } from '@ai-sdk/react'
import { useAgentMessages } from '@/components/hooks/use-agent-messages'
import { useAgentIdParam } from '@/components/hooks/use-agentId-param'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useEffect, useRef } from 'react'
import { DefaultChatTransport } from 'ai'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useChatContext } from './context/chat-context'
import ChatErrorBoundary from '@/components/chat-error-boundary'

export default function Home() {
  const agentId = useAgentIdParam()
  const { setMessages: setMessagesRef } = useChatContext()
  const isResettingRef = useRef(false)

  const {
    data: agentMessages,
    isLoading: agentMessagesIsLoading,
    error: agentMessagesError
  } = useAgentMessages(agentId || '')

  // Show toast when agent messages fail to load
  useEffect(() => {
    if (agentMessagesError) {
      toast.error(
        'Failed to load agent messages. Please check your Letta server connection.'
      )
    }
  }, [agentMessagesError])

  const { session } = useSupabase()

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agents/' + agentId + '/messages',
      headers: session?.access_token ? {
        'Authorization': `Bearer ${session.access_token}`
      } : {}
    }),
    messages: agentMessages || [],
    onError: () => {
      toast.error(
        'Unable to send message. Please double check your environment setup.'
      )
    }
  })

  // Register setMessages in context so ChatHeader can use it
  useEffect(() => {
    setMessagesRef.current = setMessages
  }, [setMessages, setMessagesRef])

  useEffect(() => {
    if (agentMessages && agentMessages.length > 0 && messages.length === 0 && !isResettingRef.current) {
      setMessages(agentMessages)
    }
  }, [agentMessages, setMessages, messages.length])

  // Listen for reset events
  useEffect(() => {
    const handleResetStart = () => {
      isResettingRef.current = true
    }
    
    const handleResetEnd = () => {
      isResettingRef.current = false
    }

    // Listen for custom reset events
    window.addEventListener('chat-reset-start', handleResetStart)
    window.addEventListener('chat-reset-end', handleResetEnd)

    return () => {
      window.removeEventListener('chat-reset-start', handleResetStart)
      window.removeEventListener('chat-reset-end', handleResetEnd)
    }
  }, [])

  if (!agentId) {
    return null
  }


  return (
    <ChatErrorBoundary>
      <div className='relative flex flex-col h-full min-w-0 gap-5 overflow-hidden pt-4'>
        <div className='flex-1 min-h-0 overflow-hidden'>
          <Messages
            messages={messages}
            status={status}
            sendMessage={sendMessage}
          />
        </div>
        {!agentMessagesIsLoading && (
          <div className='relative flex flex-col animate-fade-in-up'>
            <div className='absolute left-1/2 transform -translate-x-1/2'>
              <Toaster position='bottom-center' expand={true} />
            </div>
            <MessageComposer
              sendMessage={sendMessage}
              input=""
              setInput={() => {}}
              status={status}
            />
          </div>
        )}
      </div>
    </ChatErrorBoundary>
  )
}
