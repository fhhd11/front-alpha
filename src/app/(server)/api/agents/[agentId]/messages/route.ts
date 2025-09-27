import { NextRequest, NextResponse } from 'next/server'
import { backendClient } from '@/config/backend-client'
import { filterMessages } from './helpers'
import { Context } from '@/types'
import { convertToAiSdkMessage } from '@letta-ai/vercel-ai-sdk-provider'

async function getAgentMessages(
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

    // Get messages from Letta through backend proxy
    const messages = await backendClient.get(`/api/v1/letta/agents/${agentId}/messages?limit=100`, authHeader)
    const filteredMessages = filterMessages(messages)
    
    // Normalize message format for official convertToAiSdkMessage function
    const normalizedMessages = filteredMessages.map((message: { message_type?: string; messageType?: string; [key: string]: unknown }) => ({
      ...message,
      messageType: message.message_type || message.messageType
    }))
    
    // Use official convertToAiSdkMessage function from @letta-ai/vercel-ai-sdk-provider
    const convertedMessages = convertToAiSdkMessage(normalizedMessages)
    
    return NextResponse.json(convertedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Error fetching messages' },
      { status: 500 }
    )
  }
}

async function sendMessage(
  req: NextRequest,
  context: Context<{ agentId: string }>
) {
  const { agentId } = await context.params
  const authHeader = req.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 })
  }

  try {
    // Get user info from backend
    const userInfo = await backendClient.get('/api/v1/me', authHeader)
    
    // Check if user has agents array
    if (!userInfo.agents || !Array.isArray(userInfo.agents) || userInfo.agents.length === 0) {
      // Fallback to letta_agent_id if agents array is not available
      if (userInfo.letta_agent_id !== agentId) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
    } else {
      // Find the specific agent in agents array
      const agent = userInfo.agents.find((a: { agent_id?: string; id?: string; [key: string]: unknown }) => a.agent_id === agentId || a.id === agentId)
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
    }

  const { messages } = await req.json()

    // Get the last user message to send to Letta
    const lastUserMessage = messages[messages.length - 1]
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 })
    }

     // Convert AI SDK message to Letta format
     const lettaMessage = {
       messages: [{
         role: 'user',
         content: lastUserMessage.parts?.[0]?.text || lastUserMessage.content || ''
       }],
       stream_tokens: true,
       stream_steps: true
     }

    // Send message to Letta via backend proxy streaming endpoint
    
    const streamResponse = await fetch(`${backendClient.baseUrl}/api/v1/letta/agents/${agentId}/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(lettaMessage)
    })


    if (!streamResponse.ok) {
      const errorText = await streamResponse.text()
      console.error('Letta streaming error:', streamResponse.status, errorText)
      return NextResponse.json({ error: 'Failed to stream from Letta' }, { status: streamResponse.status })
    }

    // Create a readable stream that converts Letta streaming format to AI SDK format
    const stream = new ReadableStream({
      async start(controller) {
        const reader = streamResponse.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        // let chunkCount = 0
        // let lineCount = 0
        const messageBuffers = new Map<string, string>() // Buffer for collecting partial messages by ID
        const textStartSent = new Set<string>() // Track which messages have sent text-start
        let buffer = '' // Buffer for incomplete JSON lines

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }

            // chunkCount++
            const chunk = decoder.decode(value, { stream: true })
            
            // Add chunk to buffer
            buffer += chunk
            const lines = buffer.split('\n')
            
            // Keep the last line in buffer if it's incomplete
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.trim() === '') continue
              
              // lineCount++
              
              // Handle Server-Sent Events format
              if (line.startsWith('data: ')) {
                const jsonData = line.substring(6) // Remove 'data: ' prefix
                
                // Skip [DONE] marker
                if (jsonData === '[DONE]') {
                  continue
                }
                
                try {
                  const data = JSON.parse(jsonData)
                  
                  // Handle reasoning messages - stream in real-time
                  if (data.message_type === 'reasoning_message' && data.id) {
                    const messageId = data.id
                    const reasoning = data.reasoning || ''
                    
                    
                    // Store reasoning content for this message
                    if (!messageBuffers.has(messageId + '-reasoning')) {
                      messageBuffers.set(messageId + '-reasoning', '')
                      
                      // Send reasoning-start only once per message
                      const reasoningStart = `data: ${JSON.stringify({
                        type: 'reasoning-start',
                        id: messageId + '-reasoning'
                      })}\n\n`
                      controller.enqueue(encoder.encode(reasoningStart))
                    }
                    
                    const currentReasoningBuffer = messageBuffers.get(messageId + '-reasoning') || ''
                    const newReasoningBuffer = currentReasoningBuffer + reasoning
                    messageBuffers.set(messageId + '-reasoning', newReasoningBuffer)
                    
                    
                    // Send reasoning-delta with the new reasoning chunk
                    if (reasoning.length > 0) {
                      const reasoningDelta = `data: ${JSON.stringify({
                        type: 'reasoning-delta',
                        id: messageId + '-reasoning',
                        delta: reasoning
                      })}\n\n`
                      controller.enqueue(encoder.encode(reasoningDelta))
                    }
                  }
                  
                  // Handle token streaming for assistant messages
                  if (data.message_type === 'assistant_message' && data.id) {
                    const messageId = data.id
                    const content = data.content || ''
                    
                    
                    // Initialize buffer for this message if not exists
                    if (!messageBuffers.has(messageId)) {
                      messageBuffers.set(messageId, '')
                    }
                    
                    // Add content to buffer
                    const currentBuffer = messageBuffers.get(messageId) || ''
                    const newBuffer = currentBuffer + content
                    messageBuffers.set(messageId, newBuffer)
                    
                    
                    // Send text-start only once per message
                    if (!textStartSent.has(messageId)) {
                      const textStart = `data: ${JSON.stringify({
                        type: 'text-start',
                        id: messageId
                      })}\n\n`
                      controller.enqueue(encoder.encode(textStart))
                      textStartSent.add(messageId)
                    }
                    
                    // Send text-delta with the new content chunk
                    if (content.length > 0) {
                      const textDelta = `data: ${JSON.stringify({
                        type: 'text-delta',
                        id: messageId,
                        delta: content
                      })}\n\n`
                      controller.enqueue(encoder.encode(textDelta))
                    }
                    
                    // Check if this is the final chunk (no more content expected)
                    // We'll send text-end when we detect the message is complete
                    // This could be determined by a specific marker or when stream ends
                  }
                  
                  // Handle stop_reason to signal end of message
                  if (data.message_type === 'stop_reason') {
                    
                    // Send text-end for all active messages and include reasoning if available
                    for (const [messageId] of messageBuffers.entries()) {
                      if (messageId.endsWith('-reasoning')) {
                        // Skip reasoning buffers here, they'll be handled with the main message
                        continue
                      }
                      
                      const textEnd = `data: ${JSON.stringify({
                        type: 'text-end',
                        id: messageId
                      })}\n\n`
                      controller.enqueue(encoder.encode(textEnd))
                      
                      // Check if there's reasoning content for this message and send reasoning-end
                      const reasoningBuffer = messageBuffers.get(messageId + '-reasoning')
                      if (reasoningBuffer && reasoningBuffer.length > 0) {
                        
                        // Send reasoning-end to close the reasoning stream
                        const reasoningEnd = `data: ${JSON.stringify({
                          type: 'reasoning-end',
                          id: messageId + '-reasoning'
                        })}\n\n`
                        controller.enqueue(encoder.encode(reasoningEnd))
                      }
                    }
                  }
                } catch (parseError) {
                  console.error('Error parsing streaming data:', parseError, 'Data:', jsonData)
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Streaming error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
  }
}

export const GET = getAgentMessages
export const POST = sendMessage