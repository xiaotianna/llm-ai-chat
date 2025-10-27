import { supabase } from '@/config/supabase'
import { ResponseData } from '@/utils/response-message'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const userInfo = JSON.parse(userInfoCookie.value)
  const userId = userInfo.id
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }
  try {
    const { data: chatHistories, error: chatError } = await supabase
      .from('chat_histories')
      .select('id, subject, create_time')
      .eq('user_id', userId)
      .order('create_time', { ascending: true })

    if (chatError) {
      console.error('Chat histories fetch error:', chatError)
      return NextResponse.json({ error: chatError.message }, { status: 500 })
    }

    return NextResponse.json(ResponseData.success(chatHistories))
  } catch (error) {
    console.error('Error in GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}