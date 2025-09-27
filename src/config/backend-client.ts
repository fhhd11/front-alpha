// Backend API client configuration
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!


export const backendClient = {
  baseUrl: BACKEND_BASE_URL,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BACKEND_BASE_URL}${endpoint}`
    
    const finalHeaders = {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'identity', // Отключаем сжатие
      'User-Agent': 'NextJS-Client',
      ...options.headers,
    }
    
    // Добавляем таймаут 60 секунд для создания агента
    const timeoutMs = endpoint.includes('/agents/create') ? 60000 : 30000
    
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
      signal: AbortSignal.timeout(timeoutMs)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend client error:', errorText)
      throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    // Проверяем Content-Type перед парсингом JSON
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    } else {
      // Если не JSON, возвращаем текст
      const text = await response.text()
      console.log('Non-JSON response:', text)
      return { message: text }
    }
  },
  
  async get(endpoint: string, authHeader?: string) {
    return this.request(endpoint, {
      method: 'GET',
      headers: authHeader ? { 
        'Authorization': authHeader
      } : {},
    })
  },
  
  async post(endpoint: string, data?: unknown, authHeader?: string) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: authHeader ? { Authorization: authHeader } : {},
    })
  },
  
  async patch(endpoint: string, data?: unknown, authHeader?: string) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: authHeader ? { Authorization: authHeader } : {},
    })
  },
  
  async delete(endpoint: string, authHeader?: string) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: authHeader ? { Authorization: authHeader } : {},
    })
  }
}
