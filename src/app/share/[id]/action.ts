'use server'

import { supabase } from '@/config/supabase'
import { supabaseAdmin } from '@/config/supabase-admin'

export type ShareHistoryResult = {
  history: {
    id: string
    subject: string
    create_time: string
    user_id: string | null
    is_share: boolean | null
  }
  /** 创建者信息（从 auth.users 的 user_metadata 获取，含 GitHub 头像） */
  creator: {
    name: string
    avatar: string | null
  } | null
  conversations: Array<{
    id: string
    history_id: string
    type: string
    content: string | null
    reasoning: string | null
    tool_calls: unknown
    tool_name: string | null
    next_id: string | null
    create_time: string
    user_id: string
  }>
}

/**
 * 获取分享的 history 记录及其 conversation 内容
 * 仅当 is_share 为 true 时返回数据
 */
export async function getShareHistoryAction(
  historyId: string
): Promise<{ data: ShareHistoryResult | null; error: string | null }> {
  if (!historyId) {
    return { data: null, error: 'History ID 不能为空' }
  }

  try {
    const { data: history, error: historyError } = await supabase
      .from('chat_histories')
      .select('id, subject, create_time, user_id, is_share')
      .eq('id', historyId)
      .eq('is_share', true)
      .single()

    if (historyError) {
      console.error('Error fetching share history:', historyError)
      return { data: null, error: '获取分享记录失败' }
    }

    if (!history) {
      return { data: null, error: '分享记录不存在或未开放分享' }
    }

    const { data: conversations, error: conversationError } = await supabase
      .from('llm_conversations')
      .select('id, history_id, type, content, reasoning, tool_calls, tool_name, next_id, create_time, user_id')
      .eq('history_id', historyId)
      .order('create_time', { ascending: true })

    if (conversationError) {
      console.error('Error fetching conversations:', conversationError)
      return { data: null, error: '获取对话内容失败' }
    }

    let creator: ShareHistoryResult['creator'] = null
    if (history.user_id && supabaseAdmin) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(history.user_id)
        if (authUser?.user?.user_metadata) {
          const meta = authUser.user.user_metadata
          creator = {
            name: meta.user_name || meta.preferred_username || meta.name || '用户',
            avatar: meta.avatar_url || null
          }
        }
      } catch (e) {
        console.warn('Failed to fetch creator from auth:', e)
      }
    }

    return {
      data: {
        history,
        creator,
        conversations: conversations ?? []
      },
      error: null
    }
  } catch (err) {
    console.error('Error in getShareHistoryAction:', err)
    return {
      data: null,
      error: err instanceof Error ? err.message : '未知错误'
    }
  }
}
