import { useAgentContext } from '@/app/[agentId]/context/agent-context'
import { useAgents } from './hooks/use-agents'
import { SkeletonLoadBlock } from './ui/skeleton-load-block'
import { LoaderCircle, RotateCcw, AlertTriangle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useResetAgentMessages } from './hooks/use-reset-agent-messages'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { useChatContext } from '@/app/[agentId]/context/chat-context'
import Image from 'next/image'

export const ChatHeader = () => {
  const { agentId } = useAgentContext()
  const { data: agentData, isLoading } = useAgents()
  const { user, session } = useSupabase()
  const { setMessages: setMessagesRef } = useChatContext()
  const resetMessages = useResetAgentMessages(agentId || '', setMessagesRef.current || undefined)

  const selectedAgent = useMemo(() => {
    if (!agentData) return null

    if (agentData.length === 0) return null

    return agentData.find((a: { id: string }) => a.id === agentId)
  }, [agentData, agentId])

  const handleResetMessages = () => {
    if (agentId) {
      resetMessages.mutate()
    }
  }

  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex-1 overflow-hidden'>
        <div className='flex items-center justify-center w-full gap-3 animate-fade-in-up'>
          <div className='relative'>
            <Image
              src="/logo.png"
              alt="etrl.chat logo"
              width={36}
              height={36}
              className="rounded-xl shadow-lg hover:scale-110 transition-transform duration-300"
            />
            <div className='absolute inset-0 rounded-xl strict-gradient-accent blur-sm -z-10 opacity-20'></div>
          </div>
          <div className='text-2xl font-bold text-slate-200'>
            etrl.chat
          </div>
        </div>
      </div>
      
      {agentId && (
        <div className='flex items-center'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                disabled={resetMessages.isPending}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reset chat history</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Reset Chat History
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reset the chat history? This action cannot be undone and will clear all messages in the current conversation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetMessages}
                  disabled={resetMessages.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {resetMessages.isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset History'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
