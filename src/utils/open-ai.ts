import { models } from '@/config/model'
import OpenAI from 'openai'

type OpenAIModelConfig = Extract<(typeof models)[number], { provider: 'openai' }>

class OpenAIClient {
  private clientCache = new Map<string, OpenAI>()

  private getModelConfig(model: string): OpenAIModelConfig {
    const modelConfig = models.find(
      (item): item is OpenAIModelConfig =>
        item.model === model && item.provider === 'openai'
    )

    if (!modelConfig) {
      throw new Error(`未找到模型配置: ${model}`)
    }

    return modelConfig
  }

  private resolveBaseURL(url?: string): string {
    if (!url) {
      throw new Error('模型配置缺少 url，无法初始化 OpenAI 客户端')
    }

    // 兼容配置里直接写到 /chat/completions 的情况，SDK 需要 baseURL
    return url.replace(/\/chat\/completions\/?$/, '')
  }

  private resolveApiKey(modelConfig: OpenAIModelConfig): string {
    const authHeader = modelConfig.requestConfig?.headers?.Authorization
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim()

    if (token) {
      return token
    }

    const baseURL = this.resolveBaseURL(modelConfig.url)
    if (baseURL.includes('api.deepseek.com')) {
      if (!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY) {
        throw new Error(
          'DeepSeek API 密钥未配置，请检查 NEXT_PUBLIC_DEEPSEEK_API_KEY'
        )
      }
      return process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
    }

    if (!process.env.NEXT_PUBLIC_OPENROUTER_KEY) {
      throw new Error(
        'OpenRouter API 密钥未配置，请检查 NEXT_PUBLIC_OPENROUTER_KEY'
      )
    }
    return process.env.NEXT_PUBLIC_OPENROUTER_KEY
  }

  private getClientByModel(model: string): OpenAI {
    const cacheKey = model
    const cached = this.clientCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const modelConfig = this.getModelConfig(model)
    const client = new OpenAI({
      baseURL: this.resolveBaseURL(modelConfig.url),
      apiKey: this.resolveApiKey(modelConfig)
    })
    this.clientCache.set(cacheKey, client)

    return client
  }

  async streamChat(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: string
  ) {
    if (!model) {
      throw new Error('请选择模型')
    }
    try {
      const openai = this.getClientByModel(model)
      return openai.chat.completions.create({
        model,
        messages,
        stream: true
      })
    } catch (error: any) {
      this.catchError(error)
    }
  }

  async chat(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: string,
    options?: Omit<
      OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
      'messages' | 'model'
    >
  ) {
    if (!model) {
      throw new Error('请选择模型')
    }
    try {
      const openai = this.getClientByModel(model)
      return await openai.chat.completions.create({
        model,
        messages,
        temperature: 0,
        ...options
      })
    } catch (error: any) {
      this.catchError(error)
    }
  }

  private catchError(error: any) {
    if (error.status === 401) {
      throw new Error('API 密钥无效或未提供，请检查模型对应供应商的环境变量')
    } else if (error.status === 402) {
      throw new Error('账户额度不足，请检查模型对应供应商账户余额')
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
