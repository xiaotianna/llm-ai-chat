import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { openai } from '@/utils/open-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { cookies } from 'next/headers'
import { insertHistoryService, queryHistoryService } from '@/services/history'
import {
  insertAIConversationService,
  insertUserConversationService
} from '@/services/conversation'
import { generateSubjectService } from '@/services/chat'

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

    let messages: ChatCompletionMessageParam[] = []
    let hasHistoryId = historyId ? true : false
    let subject: string

    if (!historyId) {
      // 生成标题
      const _genSubject = await generateSubjectService(message, model)
      const { subject: genSubject } = JSON.parse(
        _genSubject?.choices[0].message.content || '{}'
      )
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
    // 查询数据库，组合message
    messages = [
      ...messages,
      {
        role: 'user',
        content: message
      }
    ]

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

    const stream = await openai.streamChat(messages, model.model)
    // 创建 ReadableStream 来处理流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        if (!hasHistoryId) {
          controller.enqueue(
            `init: ${JSON.stringify({ historyId, subject })}\n\n`
          )
        }
        let fullContent = ''
        let fullReasoning = ''
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
                userId
              ).catch(console.error)
            }
            controller.close()
          },
          { once: true }
        )
        try {
          for await (const chunk of stream!) {
            // 检查客户端是否已断开连接
            if (request.signal.aborted) {
              controller.close()
              return
            }
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`)
            if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
              const delta = chunk.choices[0].delta
              // 收集内容
              if (delta.content) {
                fullContent += chunk.choices[0].delta.content
              }
              // 收集reasoning
              if ((delta as any).reasoning) {
                fullReasoning += (delta as any).reasoning
              }
            }
          }

          if (fullContent) {
            // 插入ai数据
            const llm_conversationsData = await insertAIConversationService(
              fullContent,
              fullReasoning,
              historyId,
              userId
            )
            // 发送用户historyId和user、ai会话消息的ai（进行替换）
            controller.enqueue(
              `done: ${JSON.stringify([
                ...userConversationData,
                ...llm_conversationsData!
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
