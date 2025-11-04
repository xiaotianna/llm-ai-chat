import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ResponseData } from '@/utils/response-message'
import { Database } from '@/types/db/supabase'
import { insertMcpConfigService } from '@/services/mcp'

export interface MCPConfig {
  create_time?: string
  id: string
  mcp_type: Database['public']['Enums']['mcp_type']
  name: string
  url: string
  desc?: string
  user_id: string
  status: boolean
}

export interface ResponseMCPConfig {
    create_time: string;
    desc: string | null;
    id: string;
    mcp_type: Database["public"]["Enums"]["mcp_type"];
    name: string;
    status: boolean | null;
    url: string;
    user_id: string;
}

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const { mcp_type, name, url, desc } = body
    const data = await insertMcpConfigService({
      mcp_type,
      name,
      url,
      desc,
      user_id: userId
    })
    return NextResponse.json(
      ResponseData.success(data, 'MCP configuration saved successfully')
    )
  } catch (error: any) {
    console.error('Error in POST MCP config:', error)
    return NextResponse.json(
      ResponseData.error(
        error.status || 500,
        error.message || 'Failed to save MCP config'
      ),
      { status: error.status || 500 }
    )
  }
}
