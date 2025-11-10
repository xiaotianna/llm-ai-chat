import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ResponseData } from '@/utils/response-message'
import { Database } from '@/types/db/supabase'
import {
  insertMcpConfigService,
  getMcpConfigsByUserId,
  getMcpConfigCountByUserId
} from '@/services/mcp'

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
  create_time: string
  desc: string | null
  id: string
  mcp_type: Database['public']['Enums']['mcp_type']
  name: string
  status: boolean | null
  url: string
  user_id: string
}

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
    const data = await getMcpConfigsByUserId(userId)
    return NextResponse.json(
      ResponseData.success(data, 'MCP configurations fetched successfully')
    )
  } catch (error: any) {
    console.error('Error in GET MCP configs:', error)
    return NextResponse.json(
      ResponseData.error(
        error.status || 500,
        error.message || 'Failed to fetch MCP configs'
      ),
      { status: error.status || 500 }
    )
  }
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
    // 检查用户已有的MCP配置数量
    const configCount = await getMcpConfigCountByUserId(userId)

    // 限制每个用户最多30个配置
    if (configCount >= 30) {
      return NextResponse.json(
        ResponseData.error(400, '每个用户最多只能添加30个MCP配置'),
        { status: 400 }
      )
    }

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
