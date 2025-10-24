// OpenAI-gpt-oss 模型采用Open Router的接口
export const OpenAIGPTOSSModel = {
  name: 'OpenAI GPT-OSS',
  description: '开源GPT架构大模型，综合能力均衡，多语言支持良好',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'openai/gpt-oss-20b:free',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b:free',
      stream: true
    })
  },
  system_message: {
    role: 'system',
    content: 'You are a helpful assistant.'
  },
  // 模型提供商
  provider: 'open-router'
} as const
