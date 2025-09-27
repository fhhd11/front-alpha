'use client'

import React, { createContext, useContext, ReactNode, useRef } from 'react'
import type { UseChatHelpers } from '@ai-sdk/react'
import type { UIMessage } from 'ai'

interface ChatContextType {
  setMessages: React.MutableRefObject<UseChatHelpers<UIMessage>['setMessages'] | null>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const setMessagesRef = useRef<UseChatHelpers<UIMessage>['setMessages'] | null>(null)

  return (
    <ChatContext.Provider value={{ setMessages: setMessagesRef }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
