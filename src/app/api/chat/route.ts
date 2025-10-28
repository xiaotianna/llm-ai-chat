import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { openai } from '@/utils/open-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { cookies } from 'next/headers'
import { supabase } from '@/config/supabase'

export async function POST(request: NextRequest) {
  // 设置 SSE 响应头
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  }

  const body = await request.json()
  const { model: modelName, message, conversationId } = body
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
    let messages: ChatCompletionMessageParam[] = []
    const userInfo = JSON.parse(userInfoCookie.value)
    const userId = userInfo.id

    // TODO
    // 查询数据库，组合message
    messages = [
      ...messages,
      {
        role: 'user',
        content: message
      }
    ]

    let historyId = conversationId
    if (!historyId) {
      const { data: chatHistoryData, error: chatHistoryError } = await supabase
        .from('chat_histories')
        .insert([
          {
            subject: message.substring(0, 50),
            user_id: userId
          }
        ])
        .select()

      if (chatHistoryError) {
        console.error('Error creating chat history:', chatHistoryError)
        return NextResponse.json(
          { error: 'Failed to create chat history' },
          { status: 500 }
        )
      }

      historyId = chatHistoryData[0]?.id
    }

    // 插入用户数据
    const { error: conversationError } =
      await supabase
        .from('llm_conversations')
        .insert([
          {
            content: message,
            history_id: historyId,
            user_id: userId,
            type: 'user'
          }
        ])
        .select()

    if (conversationError) {
      console.error('Error saving user message:', conversationError)
      return NextResponse.json(
        { error: 'Failed to save user message' },
        { status: 500 }
      )
    }

    const stream = await openai.chat(messages, model.model)
    // 创建 ReadableStream 来处理流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ''
          let fullReasoning = ''
          for await (const chunk of stream) {
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`)
            if (
              chunk.choices &&
              chunk.choices[0] &&
              chunk.choices[0].delta
            ) {
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
            const { error: saveResponseError } = await supabase
              .from('llm_conversations')
              .insert([
                {
                  content: fullContent,
                  reasoning: fullReasoning || null,
                  history_id: historyId,
                  user_id: userId,
                  type: 'assistant'
                }
              ])

            if (saveResponseError) {
              console.error('Error saving AI response:', saveResponseError)
            }
          }

          controller.close()
        } catch (error) {
          controller.error(error)
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
