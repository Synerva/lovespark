import { supabase } from '@/lib/supabase'
import type { AIMessage } from '@/lib/types'
import type { ChatHistory } from '@/types/domain'
import { requireAuthenticatedUserId } from './auth'

const MODULE_SCOPE = 'lovespark'

export async function getOrCreatePrimaryConversation(): Promise<string> {
  const userId = await requireAuthenticatedUserId()
  console.log('[Chat][DB] getOrCreatePrimaryConversation start', { userId })

  const { data: existing, error: findError } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', userId)
    .eq('module_scope', MODULE_SCOPE)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (findError) {
    console.error('[Chat][DB] Failed querying conversation:', findError)
    throw new Error('Unable to load conversation.')
  }

  if (existing?.id) {
    console.log('[Chat][DB] Using existing conversation', { userId, conversationId: existing.id })
    return existing.id
  }

  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, module_scope: MODULE_SCOPE, title: 'Primary conversation' })
    .select('id')
    .single()

  if (error) {
    console.error('[Chat][DB] Failed creating conversation:', error)
    throw new Error('Unable to create conversation.')
  }

  console.log('[Chat][DB] Created conversation', { userId, conversationId: data.id })
  return data.id
}

export async function loadChatHistory(): Promise<ChatHistory> {
  const userId = await requireAuthenticatedUserId()
  const conversationId = await getOrCreatePrimaryConversation()
  console.log('[Chat][DB] Loading chat history', { userId, conversationId })

  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed loading chat history:', error)
    throw new Error('Unable to load chat history.')
  }

  const messages: AIMessage[] = (data ?? []).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    timestamp: row.created_at,
    context: (row.context ?? undefined) as AIMessage['context'],
  }))

  return { conversationId, messages }
}

export async function saveChatMessage(
  conversationId: string,
  message: AIMessage
) {
  const userId = await requireAuthenticatedUserId()
  console.log('[Chat][DB] Message insert start', {
    userId,
    conversationId,
    role: message.role,
  })

  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role: message.role,
      content: message.content,
      context: message.context ?? null,
      created_at: message.timestamp,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Failed saving chat message:', error)
    throw new Error('Unable to save chat message.')
  }

  console.log('[Chat][DB] Message insert success', {
    userId,
    conversationId,
    messageId: data.id,
    role: data.role,
  })

  return data
}

export async function clearConversationMessages(conversationId: string) {
  const userId = await requireAuthenticatedUserId()
  const { error } = await supabase
    .from('ai_messages')
    .delete()
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)

  if (error) {
    console.error('Failed clearing conversation messages:', error)
    throw new Error('Unable to clear chat history.')
  }
}

export async function deleteMessage(messageId: string) {
  const userId = await requireAuthenticatedUserId()
  const { error } = await supabase
    .from('ai_messages')
    .delete()
    .eq('id', messageId)
    .eq('user_id', userId)

  if (error) {
    console.error('Failed deleting message:', error)
    throw new Error('Unable to delete message.')
  }
}
