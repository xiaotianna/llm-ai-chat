// 智普GLM-4.5-Air模型采用Open Router的接口
export const GLMAirModel = {
  name: 'GLM-4.5-Air',
  description: '智谱AI轻量级大模型，推理效率高，中文对话质量优秀',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'z-ai/glm-4.5-air:free',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'z-ai/glm-4.5-air:free',
      stream: true
    })
  },
  system_message: {
    role: 'system',
    content: 'You are a helpful assistant.'
  },
  // 模型提供商
  provider: 'open-router',
} as const
