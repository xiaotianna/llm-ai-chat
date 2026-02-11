import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { insertHistoryService, queryHistoryService } from '@/services/history'
import {
  insertAIConversationService,
  insertUserConversationService,
  updateConversationNextIdService,
  queryLastAIConversationService
} from '@/services/conversation'
import { ollamaGenerateSubjectService } from '@/services/chat'
import { Message, Tool, ToolCall } from 'ollama'
import { ollama } from '@/utils/ollama'
import {
  executeUpdateToolService,
  getAllToolsService,
  queryMcpConfigService
} from '@/services/mcp'
import { MCPConnect, getMcpServerUrl } from '@/utils/mcp/mcp-client'
import { StreamMessage } from '@/utils/stream-message'

export async function POST(request: NextRequest) {
  // 设置 SSE 响应头
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  }

  const body = await request.json()
  let { model: modelName, message, historyId, modelFunctional } = body
  if (!modelName) {
    return NextResponse.json({ error: '模型名缺少' }, { status: 400 })
  }
  const modelKey = modelName as ModelConfigKey
  // 获取模型配置
  const model = ModelConfig[modelKey] as ModelType
  if (!model) {
    return NextResponse.json(
      { error: `该模型${modelKey}暂不支持` },
      { status: 400 }
    )
  }
  if (!message) {
    return NextResponse.json({ error: '缺少参数messages' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const userInfoCookie = cookieStore.get('user-info')
  if (!userInfoCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { isAgent } = modelFunctional

    const userInfo = JSON.parse(userInfoCookie.value)
    const userId = userInfo.id

    let messages: Message[] = []
    let hasHistoryId = historyId ? true : false
    let subject: string

    if (!historyId) {
      // 生成标题
      const _genSubject = await ollamaGenerateSubjectService(message, model)
      const genSubject = _genSubject.subject
      subject = genSubject as string
      // 没有消息记录
      try {
        const chatHistoryData = await insertHistoryService(genSubject, userId)
        historyId = chatHistoryData.id
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // 有消息记录
      try {
        const llmConversations = await queryHistoryService(userId, historyId)
        const queryMessages = llmConversations.map((conversation) => ({
          role: conversation.type,
          content: conversation.content || ''
        }))
        messages.push(...queryMessages)
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        )
      }
    }

    // 插入用户数据
    let userConversationData
    try {
      userConversationData = await insertUserConversationService(
        message,
        historyId,
        userId
      )
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 查询数据库，组合message
    /**
     * message存储内容（主要针对role为assistant和tool)
     * @description ai回复内容
     * { role: 'assistant', content: '...', thinking: '...', tool_calls?: [...], next_id?: string }
     * @description 工具调用内容
     * { role: 'tool', content: '...', tool_name: '...', next_id?: string }
     * @description 核心 next_id -> 用于标识下一条消息
     */
    messages = [
      ...messages,
      {
        role: 'user',
        content: message
      }
    ]

    let mcp: MCPConnect
    let tools: Tool[] = []
    if (isAgent) {
      // 查询mcp配置
      const mcpConfigs = await queryMcpConfigService(userId)
      // 创建MCPConnect实例用于工具调用（Docker 内通过 getMcpServerUrl 将 localhost 转为 mcp-server）
      const configs = mcpConfigs.map((config) => ({
        id: config.id,
        name: config.name,
        type: config.mcp_type,
        url: getMcpServerUrl(config.url)
      }))
      mcp = new MCPConnect(configs)
      // 建立连接，查询所有的mcp的tools
      tools = await getAllToolsService(mcp)
    }

    // 创建 ReadableStream 来处理流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        const streamMessage = new StreamMessage(controller)
        if (!hasHistoryId) {
          streamMessage.init({ historyId, subject })
        }

        // 当前每轮对话的内容
        let fullContent = ''
        let fullReasoning = ''
        let fullToolCalls: ToolCall[] = []
        let previousMessageId: string | null = null // 用于存储上一条消息的ID，以便更新其next_id
        let isAbortSave = true // 是否保存中止的消息
        let iteration = 0
        const maxIterations = 10 // 防止无限循环

        // 监听客户端断开连接
        request.signal.addEventListener(
          'abort',
          () => {
            // 如果已经有部分内容，则保存
            if (isAbortSave && (fullContent || fullReasoning)) {
              // 使用 Promise 处理异步操作，但不等待结果
              insertAIConversationService(
                fullContent,
                fullReasoning,
                historyId,
                userId,
                undefined // 没有工具调用
                // 不传next_id参数
              )
                .then((llm_conversationsData) => {
                  // 如果有前一条消息，更新其next_id为当前消息的ID
                  if (
                    previousMessageId &&
                    llm_conversationsData &&
                    llm_conversationsData.length > 0
                  ) {
                    updateConversationNextIdService(
                      previousMessageId,
                      llm_conversationsData[0].id,
                      userId
                    ).catch(console.error)
                  }
                })
                .catch(console.error)
            }
            controller.close()
          },
          { once: true }
        )

        try {
          while (iteration < maxIterations) {
            iteration++
            fullContent = ''
            fullReasoning = ''
            fullToolCalls = []

            // 检查客户端是否已断开连接
            if (request.signal.aborted) {
              controller.close()
              return
            }

            const stream = await ollama.stream(modelName, messages, {
              think: true,
              tools: isAgent ? tools : undefined
            })

            for await (const chunk of stream!) {
              // 收集message数据，供下次调用
              if (chunk) {
                const delta = chunk.message
                // 收集内容
                if (delta.content) {
                  fullContent += delta.content
                  // 如果有prev_id就代表是agent消息（有多轮），第二轮开始的才有prev_id
                  streamMessage.data({
                    content: delta.content,
                    prev_id: previousMessageId
                  })
                }
                // 收集reasoning
                if (delta.thinking) {
                  fullReasoning += delta.thinking
                  streamMessage.data({
                    reasoning: delta.thinking,
                    prev_id: previousMessageId
                  })
                }
                // 收集tool_calls
                if (delta.tool_calls) {
                  fullToolCalls = delta.tool_calls
                }
              }
            }

            // 将AI消息添加到消息历史中
            messages.push({
              role: 'assistant',
              thinking: fullReasoning,
              content: fullContent,
              tool_calls: fullToolCalls
            })
            isAbortSave = false
            // 插入ai数据，不设置next_id（将在插入下一条消息时更新）
            const llm_conversationsData = await insertAIConversationService(
              fullContent,
              fullReasoning,
              historyId,
              userId,
              fullToolCalls
              // 不传next_id参数
            )
            isAbortSave = true
            fullContent = ''
            fullReasoning = ''
            // 如果有前一条消息，更新其next_id为当前消息的ID
            if (
              previousMessageId &&
              llm_conversationsData &&
              llm_conversationsData.length > 0
            ) {
              await updateConversationNextIdService(
                previousMessageId,
                llm_conversationsData[0].id,
                userId
              )
            }

            // 更新previousMessageId为当前插入消息的ID
            if (llm_conversationsData && llm_conversationsData.length > 0) {
              previousMessageId = llm_conversationsData[0].id
            }

            // 检查是否有工具调用
            if (isAgent && fullToolCalls && fullToolCalls.length > 0) {
              for (const toolCall of fullToolCalls) {
                const toolName = toolCall.function.name
                const toolArgs = toolCall.function.arguments as Record<
                  string,
                  any
                >
                // 保存一下，防止后续更新覆盖
                let prevId = previousMessageId
                try {
                  const toolResult = await mcp.executeServerTool(
                    toolName,
                    toolArgs
                  )
                  const content = {
                    input: toolArgs,
                    output: toolResult
                  }
                  if (request.signal.aborted) return
                  let toolPreviousMessageId = await executeUpdateToolService({
                    toolName,
                    content: JSON.stringify(content),
                    historyId,
                    userId,
                    previousMessageId
                  })
                  previousMessageId = toolPreviousMessageId
                  messages.push({
                    role: 'tool',
                    content: JSON.stringify(content),
                    tool_name: toolName
                  })
                  // 如果有prev_id就代表是agent消息（有多轮），第二轮开始的才有prev_id
                  streamMessage.tool({
                    ...content,
                    tool_name: toolName,
                    prev_id: prevId
                  })
                } catch (error) {
                  // 错误处理：将错误信息加入消息历史
                  const errorContent = JSON.stringify({
                    success: false,
                    input: toolArgs,
                    error: (error as Error).message
                  })
                  if (request.signal.aborted) return
                  let toolPreviousMessageId = await executeUpdateToolService({
                    toolName,
                    content: errorContent,
                    historyId,
                    userId,
                    previousMessageId
                  })
                  previousMessageId = toolPreviousMessageId
                  messages.push({
                    role: 'tool',
                    content: errorContent,
                    tool_name: toolName
                  })
                  // 发送前端
                  streamMessage.tool({ error: errorContent, prev_id: prevId })
                }
              }
            } else {
              // 没有更多工具调用，结束循环
              // 发送用户historyId和user、ai会话消息的ai（进行替换）
              // 多轮对话消息，只需要补齐最后一次对话id即可，之前的链表消息id已经通过prev_id传回
              const llm_lastConversationsData =
                await queryLastAIConversationService(userId, historyId)
              streamMessage.done([
                ...userConversationData,
                llm_lastConversationsData
              ])
              break
            }
          }
          controller.close()
        } catch (error) {
          if (request.signal.aborted) {
            controller.close()
            return
          }
          throw error
        } finally {
          // 确保关闭连接
          await mcp.closeConnection()
        }
      }
    })
    return new Response(readableStream, { headers })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
