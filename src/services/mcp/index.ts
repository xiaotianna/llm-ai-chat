import { supabase } from '@/config/supabase'
import { Database } from '@/types/db/supabase'

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