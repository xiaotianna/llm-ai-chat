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
  insertAIToolConversationService
} from '@/services/conversation'
import { ollamaGenerateSubjectService } from '@/services/chat'
import { Message, ToolCall } from 'ollama'
import { ollama } from '@/utils/ollama'
import { getAllToolsService, queryMcpConfigService } from '@/services/mcp'
import { MCPConnect } from '@/utils/mcp/mcp-client'

export async function POST(request: NextRequest) {
  // 设置 SSE 响应头
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  }

  const body = await request.json()
  let { model: modelName, message, historyId } = body
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
      // TODO
      // ...messages,
      {
        role: 'user',
        content: message
      }
    ]

    // 查询mcp配置
    const mcpConfigs = await queryMcpConfigService(userId)
    // 创建MCPConnect实例用于工具调用
    const configs = mcpConfigs.map((config) => ({
      id: config.id,
      name: config.name,
      type: config.mcp_type,
      url: config.url
    }))
    const mcp = new MCPConnect(configs)
    // 建立连接，查询所有的mcp的tools
    const tools = await getAllToolsService(mcp)

    // 创建 ReadableStream 来处理流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        if (!hasHistoryId) {
          controller.enqueue(
            `init: ${JSON.stringify({ historyId, subject })}\n\n`
          )
        }

        // 当前每轮对话的内容
        let fullContent = ''
        let fullReasoning = ''
        let fullToolCalls: ToolCall[] = []
        let previousMessageId: string | null = null // 用于存储上一条消息的ID，以便更新其next_id
        let iteration = 0
        const maxIterations = 10 // 防止无限循环

        // 监听客户端断开连接
        request.signal.addEventListener(
          'abort',
          () => {
            // 如果已经有部分内容，则保存
            if (fullContent || fullReasoning) {
              // 使用 Promise 处理异步操作，但不等待结果
              insertAIConversationService(
                fullContent,
                fullReasoning,
                historyId,
                userId,
                undefined // 没有工具调用
                // 不传next_id参数
              ).then((llm_conversationsData) => {
                // 如果有前一条消息，更新其next_id为当前消息的ID
                if (previousMessageId && llm_conversationsData && llm_conversationsData.length > 0) {
                  updateConversationNextIdService(
                    previousMessageId,
                    llm_conversationsData[0].id,
                    userId
                  ).catch(console.error)
                }
              }).catch(console.error)
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
            // TODO 停止逻辑没有测试
            if (request.signal.aborted) {
              controller.close()
              return
            }

            const stream = await ollama.stream(modelName, messages, {
              think: true,
              tools: tools
            })

            for await (const chunk of stream!) {
              // 收集message数据，供下次调用
              if (chunk) {
                const delta = chunk.message
                // 收集内容
                if (delta.content) {
                  fullContent += delta.content
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      content: delta.content
                    })}\n\n`
                  )
                }
                // 收集reasoning
                if (delta.thinking) {
                  fullReasoning += delta.thinking
                  controller.enqueue(
                    `data: ${JSON.stringify({
                      reasoning: delta.thinking
                    })}\n\n`
                  )
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
            // 插入ai数据，不设置next_id（将在插入下一条消息时更新）
            const llm_conversationsData = await insertAIConversationService(
              fullContent,
              fullReasoning,
              historyId,
              userId,
              fullToolCalls
              // 不传next_id参数
            )

            // 如果有前一条消息，更新其next_id为当前消息的ID
            if (previousMessageId && llm_conversationsData && llm_conversationsData.length > 0) {
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
            if (fullToolCalls && fullToolCalls.length > 0) {
              for (const toolCall of fullToolCalls) {
                const toolName = toolCall.function.name
                const toolArgs = toolCall.function.arguments as Record<
                  string,
                  any
                >
                try {
                  const toolResult = await mcp.executeServerTool(
                    toolName,
                    toolArgs
                  )
                  const content = {
                    input: toolArgs,
                    output: toolResult
                  }
                  messages.push({
                    role: 'tool',
                    content: JSON.stringify(content),
                    tool_name: toolName
                  })
                  
                  // 存储工具调用结果到数据库
                  const toolConversationData = await insertAIToolConversationService(
                    historyId,
                    userId,
                    JSON.stringify(content),
                    toolName
                    // 不传next_id参数
                  )
                  
                  // 如果有前一条消息，更新其next_id为当前工具调用消息的ID
                  if (previousMessageId && toolConversationData && toolConversationData.length > 0) {
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
                  
                  controller.enqueue(
                    `tool: ${JSON.stringify({
                      content: content
                    })}\n\n`
                  )
                } catch (error) {
                  // 错误处理：将错误信息加入消息历史
                  const errorContent = JSON.stringify({
                    success: false,
                    input: toolArgs,
                    error: (error as Error).message
                  })
                  
                  messages.push({
                    role: 'tool',
                    content: errorContent,
                    tool_name: toolName
                  })
                  
                  // 存储工具调用错误到数据库
                  const toolConversationData = await insertAIToolConversationService(
                    historyId,
                    userId,
                    errorContent,
                    toolName
                    // 不传next_id参数
                  )
                  
                  // 如果有前一条消息，更新其next_id为当前工具调用消息的ID
                  if (previousMessageId && toolConversationData && toolConversationData.length > 0) {
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
                  
                  // 发送前端
                  controller.enqueue(
                    `tool: ${JSON.stringify({
                      content: errorContent
                    })}\n\n`
                  )
                }
              }
            } else {
              // 没有更多工具调用，结束循环
              break
            }
          }

          // 发送最终响应给前端，不插入数据库记录
          if (fullContent) {
            // TODO 暂时有问题
            // 创建临时的消息对象用于发送给前端
            const tempConversationData = {
              id: 'temp-id', // 临时ID，不会存储到数据库
              content: fullContent,
              reasoning: '',
              history_id: historyId,
              user_id: userId,
              tool_calls: undefined,
              next_id: null,
              type: 'assistant',
              create_time: new Date().toISOString()
            };
            
            // 发送用户historyId和user、ai会话消息的ai（进行替换）
            controller.enqueue(
              `done: ${JSON.stringify([
                ...userConversationData,
                tempConversationData
              ])}\n\n`
            )
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
