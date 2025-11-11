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

// 查询历史记录列表
export const queryHistoryListService = async (userId: string) => {
  const { data: chatHistories, error: chatError } = await supabase
    .from('chat_histories')
    .select('id, subject, create_time')
    .eq('user_id', userId)
    .order('create_time', { ascending: true })

  if (chatError) {
    console.error('Chat histories fetch error:', chatError)
    throw new HttpError('Failed to fetch chat histories', 500)
  }

  return chatHistories
}

// 查询历史记录
export const queryHistoryService = async (
  userId: string,
  historyId: string
) => {
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
    .limit(50) // 只保留最新的50条记录

  if (conversationError) {
    console.error('LLM conversations fetch error:', conversationError)
    throw new HttpError(conversationError.message, 500)
  }

  return llmConversations
}

// 更新历史记录subject
export const updateHistorySubjectService = async (
  subject: string,
  historyId: string,
  userId: string
) => {
  if (!historyId || !subject) {
    throw new HttpError('Invalid historyId or subject', 400)
  }

  // 更新历史记录的主题
  const { data, error } = await supabase
    .from('chat_histories')
    .update({ subject })
    .eq('id', historyId)
    .eq('user_id', userId)
    .select()

  if (error) {
    console.error('Error updating history:', error)
    throw new HttpError('Failed to update history', 500)
  }

  if (data.length === 0) {
    throw new HttpError('History not found', 404)
  }

  return data[0]
}

// 删除历史记录
export const deleteHistoryService = async (
  historyId: string,
  userId: string
) => {
  // 先删除关联的 llm_conversations 记录
  const { error: conversationDeleteError } = await supabase
    .from('llm_conversations')
    .delete()
    .eq('history_id', historyId)
    .eq('user_id', userId)

  if (conversationDeleteError) {
    console.error('LLM conversations delete error:', conversationDeleteError)
    throw new HttpError(
      conversationDeleteError.message,
      500
    )
  }

  // 再删除 chat_histories 记录
  const { error: deleteError } = await supabase
    .from('chat_histories')
    .delete()
    .eq('id', historyId)
    .eq('user_id', userId)

  if (deleteError) {
    console.error(`delete error:`, deleteError)
    throw new HttpError(deleteError.message, 500)
  }
}
