import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { openai } from '@/utils/open-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/db/supabase'
import { supabase } from '@/config/supabase'

// Create a Supabase client with service role key (bypasses RLS)
const getServiceSupabase = () => {
  // Use the service role key to bypass RLS
  // This key should be stored in environment variables in production
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey!
  )
}

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
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    let messages: ChatCompletionMessageParam[] = []
    const userInfo = JSON.parse(userInfoCookie.value)
    const userId = userInfo.id

    // 查询数据库，组合message
    messages = [
      ...messages,
      {
        role: 'user',
        content: message
      }
    ]

    const serviceSupabase = getServiceSupabase()

    let historyId = conversationId
    if (!historyId) {
      const { data: chatHistoryData, error: chatHistoryError } = await supabase
        .from('chat_histories')
        .insert([
          {
            subject: message.substring(0, 50), // Use first 50 characters of message as subject
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

      // Use the ID of the newly created chat history
      historyId = chatHistoryData[0]?.id
    }

    // Save the user's message to llm_conversations
    const { data: conversationData, error: conversationError } =
      await serviceSupabase
        .from('llm_conversations')
        .insert([
          {
            content: message,
            history_id: historyId,
            user_id: userId
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
          // Collect the full response to save it later
          let fullResponse = ''

          for await (const chunk of stream) {
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`)
            // Collect the response content
            if (
              chunk.choices &&
              chunk.choices[0] &&
              chunk.choices[0].delta &&
              chunk.choices[0].delta.content
            ) {
              fullResponse += chunk.choices[0].delta.content
            }
          }

          // Save the AI's response to llm_conversations after the stream is complete
          if (fullResponse) {
            const { error: saveResponseError } = await serviceSupabase
              .from('llm_conversations')
              .insert([
                {
                  content: fullResponse,
                  history_id: historyId,
                  user_id: userId
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
