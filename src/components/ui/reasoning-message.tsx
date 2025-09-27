import * as React from 'react'

interface ReasoningMessageProps {
  message: string
  isEnabled: boolean
}

const ReasoningMessageBlock = (props: ReasoningMessageProps) => {
  const { message, isEnabled } = props

  return (
    <div
      className={`w-full max-w-[85%] mb-4 ${!isEnabled && 'hidden'}`}
    >
      <div className='glass rounded-xl px-4 py-3 text-sm text-muted-foreground border border-border/20 shadow-lg'>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-3 h-3 strict-gradient-accent rounded-full animate-pulse-glow"></div>
            <div className="absolute inset-0 w-3 h-3 strict-gradient-accent rounded-full blur-sm opacity-40 animate-pulse-glow"></div>
          </div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reasoning</span>
        </div>
        <div className="text-sm leading-relaxed italic">{message}</div>
      </div>
    </div>
  )
}

export { ReasoningMessageBlock }
