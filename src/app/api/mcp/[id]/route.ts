import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ResponseData } from '@/utils/response-message'
import { Database } from '@/types/db/supabase'
import { updateMcpConfigService, deleteMcpConfigService } from '@/services/mcp'

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params
    const body = await request.json()
    const { mcp_type, name, url, desc, status } = body

    // 构建更新对象，只包含提供的字段
    const updateData: Partial<MCPConfig> = {}
    if (mcp_type !== undefined) updateData.mcp_type = mcp_type
    if (name !== undefined) updateData.name = name
    if (url !== undefined) updateData.url = url
    if (desc !== undefined) updateData.desc = desc
    if (status !== undefined) updateData.status = status

    const data = await updateMcpConfigService(id, updateData)
    return NextResponse.json(
      ResponseData.success(data, 'MCP configuration updated successfully')
    )
  } catch (error: any) {
    console.error('Error in PUT MCP config:', error)
    return NextResponse.json(
      ResponseData.error(
        error.status || 500,
        error.message || 'Failed to update MCP config'
      ),
      { status: error.status || 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params
    const data = await deleteMcpConfigService(id)
    return NextResponse.json(
      ResponseData.success(data, 'MCP configuration deleted successfully')
    )
  } catch (error: any) {
    console.error('Error in DELETE MCP config:', error)
    return NextResponse.json(
      ResponseData.error(
        error.status || 500,
        error.message || 'Failed to delete MCP config'
      ),
      { status: error.status || 500 }
    )
  }
}