import { supabase } from '@/config/supabase'
import { Database } from '@/types/db/supabase'
import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 会话id
  const { id } = await params
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), {
      status: 401
    })
  }
  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id

  // 先查询 chat_histories 表
  const { data: chatHistory, error: historyError } = await supabase
    .from('chat_histories')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (historyError || !chatHistory) {
    console.error('Chat history fetch error:', historyError)
    return NextResponse.json(
      { error: 'Chat history not found' },
      { status: 404 }
    )
  }

  const { data: llmConversations, error: conversationError } = await supabase
    .from('llm_conversations')
    .select('*')
    .eq('history_id', chatHistory.id)
    .eq('user_id', userId)
    .order('create_time', { ascending: true })

  if (conversationError) {
    console.error('LLM conversations fetch error:', conversationError)
    return NextResponse.json(
      { error: conversationError.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    ResponseData.success(llmConversations, 'Get conversations successfully')
  )
}

export type ResponseMessage = {
    content: string;
    create_time: string;
    history_id: string;
    id: string;
    reasoning: string;
    type: Database["public"]["Enums"]["conversations_type"];
    user_id: string;
}