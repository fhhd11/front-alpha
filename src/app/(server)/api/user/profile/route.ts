import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
  }

  try {
    // Получаем данные пользователя через backend
    const userInfo = await backendClient.get('/api/v1/me', authHeader)
    
    return NextResponse.json(userInfo)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    
    // Если пользователь не найден в user_profiles, возвращаем 404
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Error fetching user profile' },
      { status: 500 }
    )
  }
}
