import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'
import type { Context } from '@/types'

export async function PATCH(
  req: NextRequest,
  context: Context<{ agentId: string }>
) {
  try {
    const { agentId } = await context.params
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    // Call Letta's reset-messages endpoint
    const response = await fetch(`${backendClient.baseUrl}/api/v1/letta/agents/${agentId}/reset-messages`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      // Add default initial messages if needed
      body: JSON.stringify({ add_default_initial_messages: false })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Letta reset-messages API Error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to reset agent messages' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error resetting agent messages:', error)
    return NextResponse.json(
      { error: 'Error resetting agent messages' },
      { status: 500 }
    )
  }
}

