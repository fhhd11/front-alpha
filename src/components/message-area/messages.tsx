import { useEffect, useMemo, useRef } from 'react'
import { MessagePill } from '@/components/ui/message'
import { Ellipsis, LoaderCircle } from 'lucide-react'
import { MessagePopover } from './message-popover'
import { DEFAULT_BOT_MESSAGE, ERROR_CONNECTING } from '@/app/lib/labels'
import { useIsConnected } from '../hooks/use-is-connected'
import { useAgents } from '../hooks/use-agents'
import { ReasoningMessageBlock } from '@/components/ui/reasoning-message'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { UIMessage } from 'ai'
import { ToolCallMessageBlock } from '@/components/ui/tool-call-message'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat-bubble'
import Markdown from 'react-markdown'

interface MessagesProps {
  messages: UIMessage[]
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  sendMessage: (message: { text: string }) => void
}

export const Messages = (props: MessagesProps) => {
  const { messages, status, sendMessage } = props
  const { data: agents } = useAgents()

  const messagesListRef = useRef<HTMLDivElement>(null)
  const isConnected = useIsConnected()

  const isSendingMessage = status === 'submitted' || status === 'streaming'

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // scroll to the bottom on first render and when messages change
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const showPopover = useMemo(() => {
    if (!messages) {
      return false
    }

    const firstReasoningPart = messages[0]?.parts?.find(
      (part) => part.type === 'reasoning' && 'reasoning' in part
    ) as { reasoning?: string } | undefined

    return (
      messages.length === 2 &&
      firstReasoningPart?.reasoning === DEFAULT_BOT_MESSAGE
    )
  }, [messages])

  return (
    <div ref={messagesListRef} className='h-full overflow-y-auto hide-scrollbar'>
      <div className='group/message mx-auto w-full max-w-3xl px-4 py-4'>
        <div className='flex flex-col'>
          {messages ? (
            showPopover ? (
              <MessagePopover key={messages[0].id} sendMessage={sendMessage} />
            ) : (
              <div
                className='flex min-w-0 flex-col gap-4'
                key='messages-list'
              >
                {messages.map((message: UIMessage, index: number) => {
                  const reasoningPart = message.parts?.find(
                    (part) => part.type === 'reasoning'
                  )
                  const toolCallPart = message.parts?.find((part) =>
                    part.type.includes('tool-')
                  )

                  return (
                    <div 
                      key={message.id}
                      className={`animate-fade-in-up space-y-2`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {toolCallPart && (
                        <div className="animate-slide-in-right">
                          <ToolCallMessageBlock
                            key={message.id + '_' + toolCallPart.type}
                            message={toolCallPart.type}
                            isEnabled={true}
                          />
                        </div>
                      )}

                      {reasoningPart && reasoningPart.type === 'reasoning' && (
                        <div className="animate-slide-in-left">
                          <ReasoningMessageBlock
                            data-id={message.id + '_' + reasoningPart.type}
                            key={message.id + '_' + reasoningPart.type}
                            message={reasoningPart.text}
                            isEnabled={true}
                          />
                        </div>
                      )}

                      {message.parts?.map((part, partIndex) => {
                        if (part.type === 'text') {
                          return (
                            <div 
                              key={message.id + '_' + message.role + '_' + partIndex}
                              className={message.role === 'user' ? 'animate-slide-in-right' : 'animate-slide-in-left'}
                            >
                              <ChatBubble variant={message.role === 'user' ? 'sent' : 'received'}>
                                <ChatBubbleAvatar 
                                  fallback={message.role === 'user' ? 'U' : 'AI'}
                                  src={message.role === 'user' 
                                    ? "/user-avatar.png"
                                    : "/ai-avatar.png"
                                  }
                                />
                                <ChatBubbleMessage 
                                  variant={message.role === 'user' ? 'sent' : 'received'}
                                  className="glass border border-border/20 shadow-lg"
                                >
                                  <Markdown className="prose prose-sm max-w-none prose-invert [&>*]:text-white [&>p]:text-white [&>ul]:text-white [&>ol]:text-white [&>li]:text-white [&>strong]:text-white [&>em]:text-white [&>code]:text-white [&>pre]:text-white">
                                    {part.text}
                                  </Markdown>
                                </ChatBubbleMessage>
                              </ChatBubble>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  )
                })}

                {isSendingMessage && (
                  <div className='animate-fade-in-up mb-4'>
                    <ChatBubble variant="received">
                      <ChatBubbleAvatar 
                        fallback="AI"
                        src="/ai-avatar.png"
                      />
                      <ChatBubbleMessage 
                        variant="received"
                        isLoading={true}
                        className="glass border border-border/20 shadow-lg"
                      />
                    </ChatBubble>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )
          ) : (
            <div className='flex min-w-0 flex-1 flex-col justify-center items-center h-full'>
              {status === 'ready' ||
              (isConnected && agents && agents.length === 0) ? (
                <div className="glass rounded-full p-6 animate-float">
                  <LoaderCircle className='animate-spin size-8 text-primary' />
                </div>
              ) : (
                <div className="glass rounded-lg p-6 animate-fade-in-up">
                  <p className="text-muted-foreground">{ERROR_CONNECTING}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
