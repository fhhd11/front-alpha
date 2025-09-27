// import { AssistantMessageContent } from '@letta-ai/letta-client/api/types'

export enum MESSAGE_TYPE {
  USER_MESSAGE = 'user_message',
  SYSTEM_MESSAGE = 'system_message',
}

export enum ROLE_TYPE {
  USER = 'user'
}

// Removed LETTA_UID constant as we're using Supabase Auth

export type Context<T> = { params: Promise<T> }
