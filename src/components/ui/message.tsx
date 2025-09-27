import * as React from 'react'
import { cn } from '@/lib/utils'
import Markdown from 'react-markdown'
import { Message as MessageType } from '@ai-sdk/ui-utils'
import { ROLE_TYPE } from '@/types'

type Sender = MessageType['role']

interface MessagePillProps {
  message: string
  sender: Sender
}

const MessagePill = (props: MessagePillProps) => {
  const { message, sender } = props

  return (
    <div
      {...props}
      className={cn(
        'flex w-max max-w-[75%] flex-col gap-2 rounded-xl px-4 py-3 text-sm shadow-lg transition-all duration-300 hover:shadow-xl',
        sender === ROLE_TYPE.USER
          ? 'ml-auto glass bg-gradient-to-r from-primary to-primary/80 text-white border border-primary/20'
          : 'glass bg-gradient-to-r from-muted to-muted/80 border border-border/20 text-white'
      )}
    >
      <Markdown className="prose prose-sm max-w-none prose-invert [&>*]:text-white [&>p]:text-white [&>ul]:text-white [&>ol]:text-white [&>li]:text-white [&>strong]:text-white [&>em]:text-white [&>code]:text-white [&>pre]:text-white">{message}</Markdown>
    </div>
  )
}

export { MessagePill }
