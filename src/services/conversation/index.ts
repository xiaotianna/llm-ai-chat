import { supabase } from '@/config/supabase'
import { HttpError } from '@/utils/http-error'
import { ToolCall } from 'ollama'

// 工具函数：将 ToolCall 转换为 JSON 兼容格式
function convertToolCallsToJson(tool_calls?: ToolCall[]): any[] | null {
  if (!tool_calls || tool_calls.length === 0) {
    return null
  }

  return tool_calls.map((call) => ({
    function: {
      name: call.function.name,
      arguments: call.function.arguments
    }
  }))
}

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
  userId: string,
  tool_calls?: ToolCall[],
  next_id?: string | null
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
          tool_calls: convertToolCallsToJson(tool_calls),
          next_id: next_id || null,
          type: 'assistant'
        }
      ])
      .select('id, history_id, type, create_time')

  if (saveResponseError) {
    console.error('Error saving AI response:', saveResponseError)
  }

  return llm_conversationsData
}

// 插入ai的tool工具调用会话记录
export const insertAIToolConversationService = async (
  historyId: string,
  userId: string,
  content: string,
  tool_name: string,
  next_id?: string | null
) => {
  const { data: llm_conversationsData, error: saveResponseError } =
    await supabase
      .from('llm_conversations')
      .insert([
        {
          content: content,
          tool_name: tool_name,
          history_id: historyId,
          user_id: userId,
          next_id: next_id || null,
          type: 'tool'
        }
      ])
      .select('id, history_id, type, create_time')

  if (saveResponseError) {
    console.error('Error saving AI tool response:', saveResponseError)
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
    .select('id, subject')
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

  return {
    conversations: llmConversations,
    historyId: chatHistory.id,
    subject: chatHistory.subject
  }
}

// 删除某一条会话记录
export const deleteConversationService = async (
  conversationIds: string[],
  userId: string
) => {
  const { error } = await supabase
    .from('llm_conversations')
    .delete()
    .in('id', conversationIds)
    .eq('user_id', userId)

  if (error) {
    console.error(`delete error:`, error)
    throw new HttpError(error.message, 500)
  }
}

// 更新会话记录的next_id字段
export const updateConversationNextIdService = async (
  conversationId: string,
  nextId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from('llm_conversations')
    .update({ next_id: nextId })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select('id, history_id, type, create_time')

  if (error) {
    console.error('Error updating conversation next_id:', error)
    throw new Error('Error updating conversation next_id:' + error)
  }

  return data
}

// 查询最后一条ai消息
export const queryLastAIConversationService = async (
  userId: string,
  historyId: string
) => {
  const { data: llmConversations, error: conversationError } = await supabase
    .from('llm_conversations')
    .select('id, history_id, type, create_time')
    .eq('history_id', historyId)
    .eq('user_id', userId)
    .eq('type', 'assistant')
    .order('create_time', { ascending: false })
    .limit(1)
    .single()

  if (conversationError) {
    console.error('Last AI conversation fetch error:', conversationError)
    throw new HttpError(conversationError.message, 500)
  }

  return llmConversations
}
