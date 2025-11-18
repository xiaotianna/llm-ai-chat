import { MCPConfig } from '@/app/api/mcp/route'
import { supabase } from '@/config/supabase'
import { Database } from '@/types/db/supabase'
import { MCPConnect } from '@/utils/mcp/mcp-client'
import { Message, Tool } from 'ollama'
import {
  insertAIToolConversationService,
  updateConversationNextIdService
} from '../conversation'

export const insertMcpConfigService = async (mcpConfig: {
  mcp_type: Database['public']['Enums']['mcp_type']
  name: string
  url: string
  desc?: string
  user_id: string
}) => {
  const { data, error } = await supabase
    .from('mcp_config')
    .insert([
      {
        mcp_type: mcpConfig.mcp_type,
        name: mcpConfig.name,
        url: mcpConfig.url,
        desc: mcpConfig.desc,
        user_id: mcpConfig.user_id
      }
    ])
    .select()

  if (error) {
    console.error('MCP config insert error:', error)
    throw new Error('Failed to save MCP config')
  }

  return data
}

export const getMcpConfigsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('mcp_config')
    .select('*')
    .eq('user_id', userId)
    .order('create_time', { ascending: true })

  if (error) {
    console.error('Error fetching MCP configs:', error)
    throw new Error('Failed to fetch MCP configs')
  }

  return data
}

export const updateMcpConfigService = async (
  id: string,
  mcpConfig: Partial<{
    mcp_type: Database['public']['Enums']['mcp_type']
    name: string
    url: string
    desc?: string
    status: boolean | null
  }>
) => {
  const { data, error } = await supabase
    .from('mcp_config')
    .update(mcpConfig)
    .eq('id', id)
    .select()

  if (error) {
    console.error('MCP config update error:', error)
    throw new Error('Failed to update MCP config')
  }

  return data
}

export const deleteMcpConfigService = async (id: string) => {
  const { data, error } = await supabase
    .from('mcp_config')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('MCP config delete error:', error)
    throw new Error('Failed to delete MCP config')
  }

  return data
}

export const getMcpConfigCountByUserId = async (userId: string) => {
  const { count, error } = await supabase
    .from('mcp_config')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching MCP config count:', error)
    throw new Error('Failed to fetch MCP config count')
  }

  return count || 0
}

export const queryMcpConfigService = async (userId: string) => {
  const { data, error } = await supabase
    .from('mcp_config')
    .select('*')
    .eq('user_id', userId)
    .eq('status', true)

  if (error) {
    console.error('Error fetching tools:', error)
    throw new Error('Failed to fetch tools')
  }

  return data
}

export const getAllToolsService = async (mcp: MCPConnect) => {
  try {
    const tools = await mcp.getAllServerTools()
    return tools.map((tool) => {
      return {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }
      } as Tool
    })
  } catch (error) {
    console.error('Error fetching tools:', error)
    throw error
  }
}

export type ExecuteUpdateToolParamsType = {
  toolName: string
  content: string
  historyId: string
  userId: string
  previousMessageId: string | null
}

export const executeUpdateToolService = async ({
  toolName,
  content,
  historyId,
  userId,
  previousMessageId
}: ExecuteUpdateToolParamsType) => {
  // 存储工具调用结果到数据库
  const toolConversationData = await insertAIToolConversationService(
    historyId,
    userId,
    content,
    toolName
    // 不传next_id参数
  )

  // 如果有前一条消息，更新其next_id为当前工具调用消息的ID
  if (
    previousMessageId &&
    toolConversationData &&
    toolConversationData.length > 0
  ) {
    await updateConversationNextIdService(
      previousMessageId,
      toolConversationData[0].id,
      userId
    )
  }

  // 更新previousMessageId为当前插入的工具调用消息ID
  if (toolConversationData && toolConversationData.length > 0) {
    previousMessageId = toolConversationData[0].id
  }

  return previousMessageId
}
