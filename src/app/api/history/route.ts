import { supabase } from '@/config/supabase'
import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), { status: 401 })
  }
  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id
  if (!userId) {
    return NextResponse.json(ResponseData.error(400, 'User ID is required'), { status: 400 })
  }
  try {
    const { data: chatHistories, error: chatError } = await supabase
      .from('chat_histories')
      .select('id, subject, create_time')
      .eq('user_id', userId)
      .order('create_time', { ascending: true })

    if (chatError) {
      console.error('Chat histories fetch error:', chatError)
      return NextResponse.json(ResponseData.error(500, chatError.message), { status: 500 })
    }

    return NextResponse.json(ResponseData.success(chatHistories))
  } catch (error) {
    console.error('Error in GET:', error)
    return NextResponse.json(
      ResponseData.error(500, 'Internal server error'),
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), { status: 401 })
  }

  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id

  try {
    const { subject, history_id } = await request.json()

    if (!history_id || !subject) {
      return NextResponse.json(
        ResponseData.error(400, 'History ID and subject are required'),
        { status: 400 }
      )
    }

    // 更新历史记录的主题
    const { data, error } = await supabase
      .from('chat_histories')
      .update({ subject })
      .eq('id', history_id)
      .eq('user_id', userId)
      .select()

    if (error) {
      console.error('Error updating history:', error)
      return NextResponse.json(ResponseData.error(500, error.message), { status: 500 })
    }

    if (data.length === 0) {
      return NextResponse.json(
        ResponseData.error(404, 'History not found or unauthorized'),
        { status: 404 }
      )
    }

    return NextResponse.json(ResponseData.success(data[0]))
  } catch (error) {
    console.error('Error in PUT:', error)
    return NextResponse.json(
      ResponseData.error(500, 'Internal server error'),
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), { status: 401 })
  }

  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id

  try {
    const { history_id } = await request.json()

    // 先删除关联的 llm_conversations 记录
    const { error: conversationDeleteError } = await supabase
      .from('llm_conversations')
      .delete()
      .eq('history_id', history_id)
      .eq('user_id', userId)

    if (conversationDeleteError) {
      console.error('LLM conversations delete error:', conversationDeleteError)
      return NextResponse.json(
        ResponseData.error(500, conversationDeleteError.message),
        { status: 500 }
      )
    }

    // 再删除 chat_histories 记录
    const { error: deleteError } = await supabase
      .from('chat_histories')
      .delete()
      .eq('id', history_id)
      .eq('user_id', userId)

    if (deleteError) {
      console.error(`delete error:`, deleteError)
      return NextResponse.json(ResponseData.error(500, deleteError.message), { status: 500 })
    }

    return NextResponse.json(ResponseData.success(true))
  } catch (error) {
    console.error('Error in DELETE:', error)
    return NextResponse.json(
      ResponseData.error(500, 'Internal server error'),
      { status: 500 }
    )
  }
}
