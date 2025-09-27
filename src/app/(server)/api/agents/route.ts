import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'

async function getAgent(req: NextRequest) {
  // Try both lowercase and uppercase header names
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
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

    // Normalize agent_id to id for compatibility with AgentState interface
    const normalizedAgents = userInfo.agents.map((agent: { agent_id?: string; id?: string; [key: string]: unknown }) => ({
      ...agent,
      id: agent.agent_id || agent.id
    }))
    
    return NextResponse.json(normalizedAgents)
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { error: 'Error fetching agent' },
      { status: 500 }
    )
  }
}

// Remove createAgent function as agents are created automatically by backend
export const GET = getAgent
