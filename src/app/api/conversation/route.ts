import { deleteConversationService } from '@/services/conversation'
import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const { ids } = await request.json()
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
    await deleteConversationService(ids, userId)
    return NextResponse.json(ResponseData.success(200, '删除成功'))
  } catch (error: any) {
    return NextResponse.json(ResponseData.error(500, error.message))
  }
}