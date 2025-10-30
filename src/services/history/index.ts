import { supabase } from '@/config/supabase'
import { HttpError } from '@/utils/http-error'

// 插入历史记录（无history_id）
export const insertHistoryService = async (subject: string, userId: string) => {
  const { data: chatHistoryData, error: chatHistoryError } = await supabase
    .from('chat_histories')
    .insert([
      {
        subject,
        user_id: userId
      }
    ])
    .select()

  if (chatHistoryError) {
    console.error('Error creating chat history:', chatHistoryError)
    throw Error('Failed to create chat history')
  }

  return chatHistoryData[0]
}

// 查询历史记录
export const queryHistoryService = async (userId: string, historyId: string) => {
  // 先查询 chat_histories 表
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
    .order('create_time', { ascending: false })
    .limit(20) // 只保留最新的20条记录

  if (conversationError) {
    console.error('LLM conversations fetch error:', conversationError)
    throw new HttpError(conversationError.message, 500)
  }

  return llmConversations
}
