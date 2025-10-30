import { supabase } from '@/config/supabase'

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
