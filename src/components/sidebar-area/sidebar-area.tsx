import { useAgentContext } from '@/app/[agentId]/context/agent-context'
import { useModifyAgent } from '@/components/hooks/use-agent-state'
import { USE_AGENTS_KEY, useAgents } from '@/components/hooks/use-agents'
import { useGetRuntimeInfo } from '@/components/hooks/use-get-runtime-info'
import { useIsConnected } from '@/components/hooks/use-is-connected'
import { AppSidebar } from '@/components/sidebar-area/app-sidebar'
import {
  AgentDialog,
  DialogType,
  useDialogDetails
} from '@/components/ui/agent-dialog'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/ui/sidebar'
import { StatusCircle } from '@/components/ui/status-circle'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, LogOut } from 'lucide-react'
import { useMemo } from 'react'
import { SkeletonLoadBlock } from '../ui/skeleton-load-block'
import EditAgentForm from './edit-agent-form'
import { useSupabase } from '@/components/providers/supabase-provider'

export function SidebarArea() {
  const queryClient = useQueryClient()
  const { agentId } = useAgentContext()
  const { data: runtimeInfo, isLoading: isRuntimeInfoLoading } =
    useGetRuntimeInfo()

  const { data, isLoading: isAgentsLoading } = useAgents()
  const isConnected = useIsConnected()
  const { mutate: modifyAgent } = useModifyAgent(agentId)
  const { signOut, session } = useSupabase()


  const { dialogType, closeAgentDialog } = useDialogDetails()

  const scrollSidebarToCurrentAgent = () => {
    document.getElementById(agentId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const hostname = useMemo(() => {
    if (runtimeInfo?.LETTA_BASE_URL) {
      const lettaServerHostname = new URL(runtimeInfo.LETTA_BASE_URL).hostname
      return ['localhost', '127.0.0.1', '0.0.0.0'].includes(lettaServerHostname)
        ? 'LOCAL SERVER'
        : 'REMOTE SERVER'
    }

    return null
  }, [runtimeInfo])

  const isLoading = isRuntimeInfoLoading || isAgentsLoading

  return (
    <Sidebar className='mt-1'>
      <div className='flex flex-row items-center justify-between'>
        <div className='text-xs font-bold relative flex w-full min-w-0 cursor-default p-2.5 pl-4'>
          <Tooltip open={!hostname ? false : undefined}>
            <TooltipTrigger className='w-full'>
              <div
                className='flex items-center w-full'
                onClick={() => {
                  scrollSidebarToCurrentAgent()
                }}
              >
                <StatusCircle isConnected={isConnected} isLoading={isLoading} />
                {isLoading ? (
                  <SkeletonLoadBlock className='w-full h-[1.43em]' />
                ) : (
                  hostname
                )}
              </div>
              <TooltipContent>{runtimeInfo?.LETTA_BASE_URL}</TooltipContent>
            </TooltipTrigger>
          </Tooltip>
        </div>
        <div data-id='sign-out-button' className='flex justify-end p-2'>
          <Button
            type='button'
            onClick={handleSignOut}
            className='inline-flex size-3 h-fit items-center justify-center whitespace-nowrap bg-transparent font-medium text-primary shadow-none ring-offset-background transition-colors hover:hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          >
            <LogOut width={16} height={16} />
          </Button>
        </div>
      </div>

      {data && data.length > 0 && <AppSidebar agents={data} />}
      {dialogType === DialogType.EditAgent && (
        <AgentDialog
          data-id='edit-agent-dialog'
          title='Edit agent'
          content={<EditAgentForm agentId={agentId} />}
        />
      )}
    </Sidebar>
  )
}
