import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabase } from '@/config/supabase'
import { HttpError } from '@/utils/http-error'

/**
 * 更新聊天历史的分享状态
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), {
      status: 401
    })
  }

  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id
  const historyId = params.id

  if (!historyId) {
    return NextResponse.json(ResponseData.error(400, 'History ID is required'), {
      status: 400
    })
  }

  try {
    const { is_share } = await request.json()

    // 验证参数
    if (typeof is_share !== 'boolean') {
      return NextResponse.json(ResponseData.error(400, 'is_share must be a boolean'), {
        status: 400
      })
    }

    // 更新聊天历史的分享状态
    const { data, error } = await supabase
      .from('chat_histories')
      .update({ is_share })
      .eq('id', historyId)
      .eq('user_id', userId)
      .select('id, is_share')

    if (error) {
      console.error('Error updating share status:', error)
      throw new HttpError('Failed to update share status', 500)
    }

    if (data.length === 0) {
      return NextResponse.json(ResponseData.error(404, 'Chat history not found'), {
        status: 404
      })
    }

    return NextResponse.json(ResponseData.success(data[0]))
  } catch (error: any) {
    console.error('Error in PATCH /api/share/[id]:', error)
    
    if (error instanceof HttpError) {
      return NextResponse.json(ResponseData.error(error.status, error.message), {
        status: error.status
      })
    }
    
    return NextResponse.json(ResponseData.error(500, error.message || 'Internal Server Error'), {
      status: 500
    })
  }
}

/**
 * 获取聊天历史的分享状态
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), {
      status: 401
    })
  }

  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id
  const historyId = params.id

  if (!historyId) {
    return NextResponse.json(ResponseData.error(400, 'History ID is required'), {
      status: 400
    })
  }

  try {
    // 查询聊天历史的分享状态
    const { data, error } = await supabase
      .from('chat_histories')
      .select('id, is_share')
      .eq('id', historyId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching share status:', error)
      throw new HttpError('Failed to fetch share status', 500)
    }

    if (!data) {
      return NextResponse.json(ResponseData.error(404, 'Chat history not found'), {
        status: 404
      })
    }

    return NextResponse.json(ResponseData.success(data))
  } catch (error: any) {
    console.error('Error in GET /api/share/[id]:', error)
    
    if (error instanceof HttpError) {
      return NextResponse.json(ResponseData.error(error.status, error.message), {
        status: error.status
      })
    }
    
    return NextResponse.json(ResponseData.error(500, error.message || 'Internal Server Error'), {
      status: 500
    })
  }
}

/**
 * 取消分享（DELETE 请求用于取消分享）
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json(ResponseData.error(401, 'Not authenticated'), {
      status: 401
    })
  }

  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id
  const historyId = params.id

  if (!historyId) {
    return NextResponse.json(ResponseData.error(400, 'History ID is required'), {
      status: 400
    })
  }

  try {
    // 将分享状态设置为 false
    const { data, error } = await supabase
      .from('chat_histories')
      .update({ is_share: false })
      .eq('id', historyId)
      .eq('user_id', userId)
      .select('id, is_share')

    if (error) {
      console.error('Error canceling share:', error)
      throw new HttpError('Failed to cancel share', 500)
    }

    if (data.length === 0) {
      return NextResponse.json(ResponseData.error(404, 'Chat history not found'), {
        status: 404
      })
    }

    return NextResponse.json(ResponseData.success(data[0]))
  } catch (error: any) {
    console.error('Error in DELETE /api/share/[id]:', error)
    
    if (error instanceof HttpError) {
      return NextResponse.json(ResponseData.error(error.status, error.message), {
        status: error.status
      })
    }
    
    return NextResponse.json(ResponseData.error(500, error.message || 'Internal Server Error'), {
      status: 500
    })
  }
}