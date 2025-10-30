import OpenAI from 'openai'

class OpenAIClient {
  private openai!: OpenAI
  constructor() {
    this.init()
  }

  // 初始化openai
  async init() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_KEY
    })
  }

  async streamChat(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: string
  ) {
    if (!model) {
      throw new Error('请选择模型')
    }
    try {
      const completion = this.openai.chat.completions.create({
        model,
        messages,
        stream: true
      })
      return completion
    } catch (error: any) {
      // 根据错误类型提供更具体的错误信息
      this.catchError(error)
    }
  }

  async chat(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: string,
    options?: Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'messages' | 'model'>
  ) {
    if (!model) {
      throw new Error('请选择模型')
    }
    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0,
        ...options
      })
      return completion
    } catch (error: any) {
      // 根据错误类型提供更具体的错误信息
      this.catchError(error)
    }
  }

  private catchError(error: any) {
    if (error.status === 401) {
      throw new Error(
        'API 密钥无效或未提供，请检查您的 NEXT_PUBLIC_OPENROUTER_KEY 环境变量'
      )
    } else if (error.status === 405) {
      throw new Error('请求方法不被允许，可能是API端点或模型配置有误')
    } else {
      throw new Error(
        `OpenAI API 调用失败: ${error.status || '未知状态'} - ${
          error.message || '未知错误'
        }`
      )
    }
  }
}

export const openai = new OpenAIClient()
