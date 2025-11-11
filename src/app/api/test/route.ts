import { getAllToolsService, queryMcpConfigService } from '@/services/mcp'
import { MCPConfig } from '../mcp/route'
import { cookies } from 'next/headers'
import { ollama } from '@/utils/ollama'
import { Tool } from 'ollama'

export async function GET() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  const userInfo = JSON.parse(userInfoCookie!.value)
  const userId = userInfo.id
  // 查询mcp配置
  const mcpConfigs = await queryMcpConfigService(userId)
  // 建立连接，查询所有的mcp的tools
  const tools = await getAllToolsService(mcpConfigs as MCPConfig[])
  const res = await ollama.chat('Qwen3-0.6b', [
    { role: 'user', content: 'openai是什么（需要调用必应工具）' },
  ], {
    tools: tools as Tool[]
  })
  return Response.json(res)
}
