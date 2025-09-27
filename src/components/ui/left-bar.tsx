import * as React from 'react'

const LeftBar: React.FC = () => {
  return (
    <div className='relative mr-4'>
      <div className='w-1 strict-gradient-accent rounded-full h-full shadow-lg shadow-slate-500/25 animate-pulse-glow'></div>
      <div className='absolute inset-0 w-1 strict-gradient-accent rounded-full blur-sm opacity-40'></div>
    </div>
  )
}

export { LeftBar }
