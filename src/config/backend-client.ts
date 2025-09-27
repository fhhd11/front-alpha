// Backend API client configuration
import { backendUrl } from '@/lib/env'

const BACKEND_BASE_URL = backendUrl

// Debug logging for production
if (typeof window !== 'undefined') {
  console.log('Backend Config:', {
    url: BACKEND_BASE_URL,
    isLocalhost: BACKEND_BASE_URL.includes('localhost')
  })
}

export const backendClient = {
  baseUrl: BACKEND_BASE_URL,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BACKEND_BASE_URL}${endpoint}`
    
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    const response = await fetch(url, {
      ...options,
      headers: finalHeaders,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend client error:', errorText)
      throw new Error(`Backend request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    return response.json()
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
