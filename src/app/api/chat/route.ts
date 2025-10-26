import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { openai } from '@/utils/open-ai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

let messages: ChatCompletionMessageParam[] = []

export async function POST(request: NextRequest) {
  // 设置 SSE 响应头
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  }

  const body = await request.json()
  const { model: modelName, message } = body
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

  try {
    // 查询数据库，组合message
    messages = [...messages, {
      role: 'user',
      content: message
    }]
    const stream = await openai.chat(messages, model.model)
    // 创建 ReadableStream 来处理流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`)
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
