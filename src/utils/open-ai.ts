import OpenAI from 'openai'

class OpenAIClient {
  private openai!: OpenAI
  constructor() {
    this.init()
  }

  // 初始化openai
  async init() {
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v2',
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_KEY,
      // 允许在浏览器环境中使用
      // dangerouslyAllowBrowser: true,
    })
  }

  async chat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    const completion = await this.openai.chat.completions.create({
      model: 'tencent/hunyuan-a13b-instruct:free',
      messages,
      stream: true,
    })
    return completion
  }
}

export const openai = new OpenAIClient()
