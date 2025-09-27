'use client'

import { ChatHeader } from '@/components/chat-header'
import { useAgents } from '@/components/hooks/use-agents'
import { useEffect } from 'react'
import { useAgentContext } from './[agentId]/context/agent-context'
import { ChatProvider } from './[agentId]/context/chat-context'

export default function ContentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data } = useAgents()
  const { agentId, setAgentId } = useAgentContext()

  useEffect(() => {
    // In the new system, each user has exactly one agent
    if (data?.[0]?.id && !agentId) {
      setAgentId(data[0].id)
    }
  }, [data, agentId])

  return (
    <ChatProvider>
      <main className='relative flex h-dvh w-dvw flex-col overflow-hidden animated-gradient-bg'>
        {/* Animated background elements */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute top-20 left-10 w-32 h-32 strict-gradient rounded-full blur-xl animate-background-flow opacity-20'></div>
          <div className='absolute top-40 right-20 w-24 h-24 strict-gradient-accent rounded-full blur-xl animate-background-flow opacity-15' style={{animationDelay: '5s'}}></div>
          <div className='absolute bottom-40 left-1/4 w-40 h-40 strict-gradient rounded-full blur-xl animate-background-flow opacity-10' style={{animationDelay: '10s'}}></div>
          <div className='absolute top-1/2 right-1/3 w-20 h-20 strict-gradient-accent rounded-full blur-2xl animate-background-flow opacity-5' style={{animationDelay: '15s'}}></div>
        </div>
        
        <div className='relative flex border-b border-border/50 p-2.5 gap-3 w-full glass backdrop-blur-md'>
          <ChatHeader />
        </div>
        <div className='relative flex-1 min-h-0'>
          {children}
        </div>
      </main>
    </ChatProvider>
  )
}
