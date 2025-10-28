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
    if (!historyId) {
      // 没有消息记录
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
    } else {
      // 有消息记录
      // 先查询 chat_histories 表
      const { data: chatHistory, error: historyError } = await supabase
        .from('chat_histories')
        .select('id')
        .eq('id', historyId)
        .eq('user_id', userId)
        .single()

      if (historyError || !chatHistory) {
        console.error('Chat history fetch error:', historyError)
        return NextResponse.json(
          { error: 'Chat history not found' },
          { status: 404 }
        )
      }

      const { data: llmConversations, error: conversationError } =
        await supabase
          .from('llm_conversations')
          .select('*')
          .eq('history_id', chatHistory.id)
          .eq('user_id', userId)
          .order('create_time', { ascending: false })
          .limit(20) // 只保留最新的20条记录

      if (conversationError) {
        console.error('LLM conversations fetch error:', conversationError)
        return NextResponse.json(
          { error: conversationError.message },
          { status: 500 }
        )
      }
      const queryMessages = llmConversations.map((conversation) => ({
        role: conversation.type,
        content: conversation.content || ''
      }))
      messages.push(...queryMessages)
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
    const { data: userConversationData, error: conversationError } = await supabase
      .from('llm_conversations')
      .insert([
        {
          content: message,
          history_id: historyId,
          user_id: userId,
          type: 'user'
        }
      ])
      .select('id, history_id, type, create_time')

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
            const { data: llm_conversationsData, error: saveResponseError } =
              await supabase.from('llm_conversations').insert([
                {
                  content: fullContent,
                  reasoning: fullReasoning || null,
                  history_id: historyId,
                  user_id: userId,
                  type: 'assistant'
                }
              ]).select('id, history_id, type, create_time')

            if (saveResponseError) {
              console.error('Error saving AI response:', saveResponseError)
            }

            // 发送用户historyId和user、ai会话消息的ai（进行替换）
            controller.enqueue(`done: ${JSON.stringify([...userConversationData, ...llm_conversationsData!])}\n\n`)
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
