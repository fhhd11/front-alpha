import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'
import { Context } from '@/types'

async function getAgentById(
  req: NextRequest,
  context: Context<{ agentId: string }>
) {
  const { agentId } = await context.params
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
  }

  // Extract token from Bearer header
  // const token = authHeader.replace('Bearer ', '')

  try {
    // Get user info from backend
    const userInfo = await backendClient.get('/api/v1/me', authHeader)
    
    // Check if user has agents array
    if (!userInfo.agents || !Array.isArray(userInfo.agents) || userInfo.agents.length === 0) {
      return NextResponse.json({ error: 'No agents found for user' }, { status: 404 })
    }

    // Find the specific agent by agentId
    const agent = userInfo.agents.find((a: { agent_id?: string; id?: string; [key: string]: unknown }) => a.agent_id === agentId || a.id === agentId)
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Normalize agent_id to id for compatibility with AgentState interface
    const normalizedAgent = {
      ...agent,
      id: agent.agent_id || agent.id
    }
    
    return NextResponse.json(normalizedAgent)
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json({ error: 'Error fetching agent' }, { status: 500 })
  }
}

async function modifyAgentById(
  req: NextRequest,
  context: Context<{ agentId: string }>
) {
  const { agentId } = await context.params
  const authHeader = req.headers.get('authorization')
  const body = await req.json()

  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
  }

  // Extract token from Bearer header
  // const token = authHeader.replace('Bearer ', '')

  try {
    // Get user info from backend
    const userInfo = await backendClient.get('/api/v1/me', authHeader)
    
    // Check if user has agents array
    if (!userInfo.agents || !Array.isArray(userInfo.agents) || userInfo.agents.length === 0) {
      return NextResponse.json({ error: 'No agents found for user' }, { status: 404 })
    }

    // Find the specific agent by agentId
    const agent = userInfo.agents.find((a: { agent_id?: string; id?: string; [key: string]: unknown }) => a.agent_id === agentId || a.id === agentId)
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Update agent through backend proxy
    const updatedAgent = await backendClient.patch(`/api/v1/letta/agents/${agentId}`, body, authHeader)
    
    return NextResponse.json(updatedAgent)
  } catch (error) {
    console.error('Error updating agent:', error)
    return NextResponse.json({ error: 'Error updating agent' }, { status: 500 })
  }
}

// Remove deleteAgentById as agents should not be deleted in this system
export const GET = getAgentById
export const PATCH = modifyAgentById
