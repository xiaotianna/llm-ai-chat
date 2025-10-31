import {
  deleteConversationService,
  queryAllConversationService
} from '@/services/conversation'
import { Database } from '@/types/db/supabase'
import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 会话id(historyId)
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

  try {
    const llmConversations = await queryAllConversationService(userId, id)
    return NextResponse.json(
      ResponseData.success(llmConversations, 'Get conversations successfully')
    )
  } catch (error: any) {
    return NextResponse.json(ResponseData.error(error.status, error.message), {
      status: error.status
    })
  }
}

export type ResponseMessage = {
  history_Id: string
  subject: string
  conversations: {
    content: string
    create_time: string
    history_id: string
    id: string
    reasoning: string
    type: Database['public']['Enums']['conversations_type']
    user_id: string
  }[]
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  try {
    await deleteConversationService(id, userId)
    return NextResponse.json(ResponseData.success(200, '删除成功'))
  } catch (error: any) {
    return NextResponse.json(ResponseData.error(500, error.message))
  }
}
