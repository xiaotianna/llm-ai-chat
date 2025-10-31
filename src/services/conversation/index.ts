import { supabase } from '@/config/supabase'
import { HttpError } from '@/utils/http-error'

// 插入type为user的会话记录
export const insertUserConversationService = async (
  message: string,
  historyId: string,
  userId: string
) => {
  const { data: userConversationData, error: conversationError } =
    await supabase
      .from('llm_conversations')
      .insert([
        {
          content: message,
          history_id: historyId,
          user_id: userId,
          type: 'user'
        }
      ])
      .select('id, history_id, type, create_time')

  if (conversationError) {
    console.error('Error saving user message:', conversationError)
    throw new Error('Error saving user message:' + conversationError)
  }

  return userConversationData
}

// 插入type为assistant的会话记录
export const insertAIConversationService = async (
  fullContent: string,
  fullReasoning: string,
  historyId: string,
  userId: string
) => {
  const { data: llm_conversationsData, error: saveResponseError } =
    await supabase
      .from('llm_conversations')
      .insert([
        {
          content: fullContent,
          reasoning: fullReasoning || null,
          history_id: historyId,
          user_id: userId,
          type: 'assistant'
        }
      ])
      .select('id, history_id, type, create_time')

  if (saveResponseError) {
    console.error('Error saving AI response:', saveResponseError)
  }

  return llm_conversationsData
}

// 查找会话记录
export const queryAllConversationService = async (
  userId: string,
  historyId: string
) => {
  const { data: chatHistory, error: historyError } = await supabase
    .from('chat_histories')
    .select('id')
    .eq('id', historyId)
    .eq('user_id', userId)
    .single()

  if (historyError || !chatHistory) {
    console.error('Chat history fetch error:', historyError)
    throw new HttpError('Chat history not found', 404)
  }

  const { data: llmConversations, error: conversationError } = await supabase
    .from('llm_conversations')
    .select('*')
    .eq('history_id', chatHistory.id)
    .eq('user_id', userId)
    .order('create_time', { ascending: true })

  if (conversationError) {
    console.error('LLM conversations fetch error:', conversationError)
    throw new HttpError(conversationError.message, 500)
  }

  return llmConversations
}

// 删除某一条会话记录
export const deleteConversationService = async (conversationId: string, userId: string) => {
  const { error } = await supabase
    .from('llm_conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId)

  if (error) {
    console.error(`delete error:`, error)
    throw new HttpError(error.message, 500)
  }
}
