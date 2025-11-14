import { getAllToolsService, queryMcpConfigService } from '@/services/mcp'
import { cookies } from 'next/headers'
import { ollama } from '@/utils/ollama'
import { Message, Tool } from 'ollama'
import { MCPConnect } from '@/utils/mcp/mcp-client'

export async function GET() {
  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  const userInfo = JSON.parse(userInfoCookie!.value)
  const userId = userInfo.id
  // 查询mcp配置
  const mcpConfigs = await queryMcpConfigService(userId)
  // 创建MCPConnect实例用于工具调用
  const configs = mcpConfigs.map((config) => ({
    id: config.id,
    name: config.name,
    type: config.mcp_type as 'sse' | 'streamable_http',
    url: config.url
  }))
  const mcp = new MCPConnect(configs)
  // 建立连接，查询所有的mcp的tools
  const tools = await getAllToolsService(mcp)
  // 初始化消息列表（包含系统提示和用户查询）
  const messages: Message[] = [{ role: 'user', content: '南京天气如何' }]

  let iteration = 0
  const maxIterations = 10 // 防止无限循环
  while (iteration < maxIterations) {
    iteration++
    const res = await ollama.chat('Qwen3-0.6b', messages, {
      tools: tools as Tool[],
    })
    const aiMessage = res.message
    messages.push({
      role: 'assistant',
      thinking: aiMessage.thinking,
      content: aiMessage.content || '',
      tool_calls: aiMessage.tool_calls || []
    })

    // 检查是否有工具调用
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        const toolName = toolCall.function.name
        const toolArgs = toolCall.function.arguments as Record<string, any>
        try {
          const toolResult = await mcp.executeServerTool(toolName, toolArgs)
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_name: toolName
          })
        } catch (error) {
          // 错误处理：将错误信息加入消息历史
          messages.push({
            role: 'tool',
            content: JSON.stringify({
              success: false,
              error: (error as Error).message
            }),
            tool_name: toolName
          })
        }
      }
    } else {
      // 没有更多工具调用，结束循环
      break
    }
  }

  // 确保关闭连接
  await mcp.closeConnection()

  return new Response(JSON.stringify(messages), {
    headers: { 'Content-Type': 'application/json' }
  })
}
