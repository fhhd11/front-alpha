import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
  }

  try {
    const agentData = await req.json()
    
    console.log('Creating agent with data:', agentData)
    
    // Проксируем запрос к бэкенду
    const response = await backendClient.post('/api/v1/ams/agents/create', agentData, authHeader)
    
    console.log('Agent creation successful:', response)
    
    // Проверяем, что агент действительно создался
    // Ждем немного для обновления базы данных
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Проверяем профиль пользователя
    const userProfile = await backendClient.get('/api/v1/me', authHeader)
    
    console.log('User profile after agent creation:', {
      agent_status: userProfile.agent_status,
      letta_agent_id: userProfile.letta_agent_id,
      agents: userProfile.agents
    })
    
    if (userProfile.agent_status === 'registered' && userProfile.letta_agent_id) {
      console.log('Agent confirmed in user profile:', userProfile.letta_agent_id)
      return NextResponse.json({ 
        success: true, 
        agent_id: userProfile.letta_agent_id,
        message: 'Agent created successfully' 
      })
    } else {
      console.log('Agent not found in user profile, status:', userProfile.agent_status, 'letta_agent_id:', userProfile.letta_agent_id)
      return NextResponse.json(
        { error: 'Agent creation in progress - please wait' },
        { status: 202 } // Accepted
      )
    }
  } catch (error) {
    console.error('Error creating agent:', error)
    
    // Если это таймаут, возвращаем специальный статус
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Agent creation timeout - please wait and refresh' },
        { status: 408 } // Request Timeout
      )
    }
    
    // Если это ошибка "terminated", возвращаем специальный статус
    if (error instanceof Error && error.message.includes('terminated')) {
      return NextResponse.json(
        { error: 'Agent creation in progress - please wait' },
        { status: 202 } // Accepted
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error creating agent' },
      { status: 500 }
    )
  }
}
