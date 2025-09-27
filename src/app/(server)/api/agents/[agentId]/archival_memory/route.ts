import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'
import { Context } from '@/types'

async function getAgentArchivalMemory(
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

    // Get archival memory from Letta through backend proxy
    try {
      const archivalMemory = await backendClient.get(`/api/v1/letta/agents/${agentId}/passages`, authHeader)
      return NextResponse.json(archivalMemory)
    } catch (archivalError: unknown) {
      // If archival memory endpoint returns 404, return empty array instead of error
      if (archivalError instanceof Error && (archivalError.message?.includes('404') || archivalError.message?.includes('Not Found'))) {
        return NextResponse.json([])
      }
      // Re-throw other errors
      throw archivalError
    }
  } catch (error) {
    console.error('Error fetching archival memory:', error)
    return NextResponse.json(
      { error: 'Error fetching archival memory' },
      { status: 500 }
    )
  }
}

export const GET = getAgentArchivalMemory
