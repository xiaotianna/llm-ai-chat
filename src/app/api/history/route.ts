import {
  deleteHistoryService,
  queryHistoryListService,
  updateHistorySubjectService
} from '@/services/history'
import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), {
      status: 401
    })
  }
  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id
  if (!userId) {
    return NextResponse.json(ResponseData.error(400, 'User ID is required'), {
      status: 400
    })
  }
  try {
    const chatHistories = await queryHistoryListService(userId)
    return NextResponse.json(ResponseData.success(chatHistories))
  } catch (error: any) {
    console.error('Error in GET:', error)
    return NextResponse.json(ResponseData.error(error.status, error.message), {
      status: error.status
    })
  }
}

export async function PATCH(request: Request) {
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
    const { subject, history_id } = await request.json()
    const data = await updateHistorySubjectService(subject, history_id, userId)
    return NextResponse.json(ResponseData.success(data))
  } catch (error: any) {
    console.error('Error in PUT:', error)
    return NextResponse.json(ResponseData.error(error.status, error.message), {
      status: error.status
    })
  }
}

export async function DELETE(request: Request) {
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
    const { history_id } = await request.json()
    await deleteHistoryService(history_id, userId)
    return NextResponse.json(ResponseData.success(true))
  } catch (error: any) {
    console.error('Error in DELETE:', error)
    return NextResponse.json(ResponseData.error(error.status, error.message), {
      status: error.status
    })
  }
}
