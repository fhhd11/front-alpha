import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { AppSidebarMenuButton } from './app-sidebar-menu-button'
import { AgentState } from '@letta-ai/letta-client/api'
import { useAgentContext } from '@/app/[agentId]/context/agent-context'

export function AppSidebar({ agents }: { agents: AgentState[] }) {
  const { agentId, setAgentId } = useAgentContext()

  return (
    <SidebarContent id='agents-list'>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className='cursor-pointer' data-id='agents-list'>
            {agents &&
              agents.map((agent) => (
                <SidebarMenuItem key={agent.id}>
                  <AppSidebarMenuButton 
                    agent={agent} 
                    isActive={agentId === agent.id}
                    onClick={() => setAgentId(agent.id)}
                  />
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
