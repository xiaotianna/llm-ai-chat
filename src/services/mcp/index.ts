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
