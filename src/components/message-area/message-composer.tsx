'use client'

import { AIInputWithLoading } from '@/components/ui/ai-input-with-loading'
import { TEXTBOX_PLACEHOLDER } from '@/app/lib/labels'

interface MessageComposerProps {
  sendMessage: (message: { text: string }) => void
  input: string
  setInput: (value: string) => void
  status: 'submitted' | 'streaming' | 'ready' | 'error'
}

export function MessageComposer(props: MessageComposerProps) {
  const { sendMessage, status } = props

  const handleSubmit = async (value: string) => {
    if (value.trim() && status === 'ready') {
      sendMessage({ text: value })
    }
  }

  return (
    <div className='flex min-w-0 flex-col justify-end'>
      <div className='relative mx-auto flex w-full gap-2 p-4 md:max-w-3xl md:pb-6'>
        <AIInputWithLoading
          placeholder={TEXTBOX_PLACEHOLDER}
          onSubmit={handleSubmit}
          loadingDuration={2000}
        />
      </div>
    </div>
  )
}
