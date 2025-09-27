'use client'

import { useState } from 'react'
import { supabase } from '@/config/supabase'
import { backendClient } from '@/config/backend-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [registrationStep, setRegistrationStep] = useState<string>('')

  // Функция для проверки статуса пользователя в user_profiles
  const checkUserProfile = async (authToken: string): Promise<{ user: any; hasAgent: boolean }> => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to get user profile')
      }
      
      const userProfile = await response.json()
      return {
        user: userProfile,
        hasAgent: userProfile.agent_status === 'registered' && userProfile.letta_agent_id
      }
    } catch (error) {
      console.error('Error checking user profile:', error)
      throw error
    }
  }

  // Функция для создания агента
  const createAgent = async (authToken: string) => {
    try {
      const agentData = {
        template_id: "test-bot",
        agent_name: "My Agent",
        use_latest: true,
        variables: {
          custom_var: "value"
        }
      }

      console.log('Creating agent with data:', agentData)
      console.log('Using auth token:', authToken ? 'present' : 'missing')
      
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(agentData),
        // Увеличиваем таймаут до 30 секунд
        signal: AbortSignal.timeout(30000)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        
        // Если это 202 (Accepted) или 408 (Timeout), это не критическая ошибка
        if (response.status === 202 || response.status === 408) {
          console.log('Agent creation in progress, continuing...')
          return { status: 'in_progress' }
        }
        
        throw new Error(`Failed to create agent: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Agent creation response:', result)
      
      // Проверяем, есть ли ошибка в ответе
      if (result.error) {
        if (result.error.includes('in progress')) {
          return { status: 'in_progress' }
        }
        throw new Error(result.error)
      }
      
      return result
    } catch (error) {
      console.error('Error creating agent:', error)
      throw error
    }
  }

  // Функция для ожидания создания профиля пользователя и агента
  const waitForUserSetup = async (authToken: string) => {
    console.log('Starting user setup process...')
    
    // Этап 1: Ждем создания профиля пользователя
    setRegistrationStep('Ожидание создания профиля...')
    for (let i = 0; i < 15; i++) {
      try {
        const { user } = await checkUserProfile(authToken)
        if (user) {
          console.log('User profile found, agent_status:', user.agent_status)
          break
        }
      } catch (error) {
        console.log('Profile not ready yet, waiting...')
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // Этап 2: Ждем agent_status = 'pending'
    setRegistrationStep('Ожидание готовности к созданию агента...')
    for (let i = 0; i < 10; i++) {
      try {
        const { user } = await checkUserProfile(authToken)
        if (user && user.agent_status === 'pending') {
          console.log('Agent status is pending, ready to create agent')
          break
        }
      } catch (error) {
        console.log('Agent status not ready yet, waiting...')
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // Этап 3: Создаем агента
    setRegistrationStep('Создание агента...')
    try {
      const agentResult = await createAgent(authToken)
      console.log('Agent creation result:', agentResult)
      
      if (agentResult && agentResult.status === 'in_progress') {
        setRegistrationStep('Агент создается в фоне...')
      } else if (agentResult && agentResult.success) {
        setRegistrationStep('Регистрация завершена!')
        return true
      }
    } catch (error) {
      console.log('Agent creation error (may be in progress):', error)
      setRegistrationStep('Агент создается в фоне...')
    }
    
    // Этап 4: Ждем завершения создания агента
    setRegistrationStep('Ожидание завершения создания агента...')
    for (let i = 0; i < 20; i++) {
      try {
        const { hasAgent } = await checkUserProfile(authToken)
        if (hasAgent) {
          setRegistrationStep('Регистрация завершена!')
          console.log('Agent created successfully!')
          return true
        }
      } catch (error) {
        console.log('Agent not ready yet, waiting...')
      }
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    // Если не удалось создать агента
    console.log('Failed to create agent after waiting')
    toast.error('Не удалось создать агента. Попробуйте войти позже.')
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setRegistrationStep('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        toast.success('Успешный вход в систему!')
      } else {
        // Регистрация нового пользователя
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        if (data.user && data.session) {
          // Пользователь зарегистрирован и автоматически вошел в систему
          toast.success('Регистрация успешна! Настройка вашего аккаунта...')
          
          // Ждем создания профиля пользователя и агента
          const success = await waitForUserSetup(data.session.access_token)
          
          if (success) {
            toast.success('Добро пожаловать! Ваш аккаунт готов к работе.')
            // Перенаправляем на страницу с агентом
            window.location.href = '/'
          }
        } else {
          // Требуется подтверждение email
          toast.success('Проверьте вашу почту для подтверждения регистрации!')
        }
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
      setRegistrationStep('')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Вход' : 'Регистрация'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Введите ваши данные для доступа к чат-боту' 
              : 'Создайте новый аккаунт для начала работы'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {registrationStep && (
              <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded">
                {registrationStep}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {isLogin 
                ? "Нет аккаунта? Зарегистрируйтесь" 
                : "Уже есть аккаунт? Войдите"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
