'use client'
import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers/supabase-provider'

export const USE_AGENTS_KEY = ['agents']

export function useAgents() {
  const { session } = useSupabase()

  return useQuery({
    queryKey: USE_AGENTS_KEY,
    retry: 0,
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      // Сначала проверяем статус пользователя
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!userResponse.ok) {
        // Если пользователь не найден, возвращаем пустой массив
        if (userResponse.status === 404) {
          return []
        }
        throw new Error(`Failed to fetch user profile: ${userResponse.status}`)
      }
      
      const userProfile = await userResponse.json()
      
      // Если пользователь еще не зарегистрирован (нет агента), возвращаем пустой массив
      if (userProfile.agent_status !== 'registered' || !userProfile.letta_agent_id) {
        return []
      }

      // Теперь запрашиваем агентов
      const response = await fetch('/api/agents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        
        // Если агентов нет, возвращаем пустой массив вместо ошибки
        if (response.status === 404) {
          return []
        }
        
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }
      return response.json()
    },
    enabled: !!session?.access_token
  })
}
