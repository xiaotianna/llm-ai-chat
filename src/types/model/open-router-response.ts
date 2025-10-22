interface Delta {
  role: string
  content: string
  reasoning: null
  reasoning_details: any[]
}

interface Choice {
  index: number
  delta: Delta
  finish_reason: null
  native_finish_reason: null
  logprobs: null
}

// open router一条数据流的ts类型
export interface OpenRouterChunkResponse {
  id: string
  provider: string
  model: string
  object: 'chat.completion' | 'chat.completion.chunk'
  created: number
  choices: Choice[]
}

export interface OpenRouterError {
  code: string | number
  message: string
}

// open router错误返回
export interface OpenRouterErrorResponse {
  error: OpenRouterError
}
