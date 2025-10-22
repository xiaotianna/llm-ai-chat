import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // 设置 SSE 响应头
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  }

  // 获取url参数
  const searchParams = request.nextUrl.searchParams
  if (!searchParams.has('model')) {
    return NextResponse.json({ error: '模型名缺少' }, { status: 400 })
  }
  const modelKey = searchParams.get('model') as ModelConfigKey
  // 获取模型配置
  const model = ModelConfig[modelKey] as ModelType
  if (!model) {
    return NextResponse.json(
      { error: `该模型${modelKey}暂不支持` },
      { status: 400 }
    )
  }

  const body = await request.json()
  if (!body.messages) {
    return NextResponse.json({ error: '缺少参数messages' }, { status: 400 })
  }
}
