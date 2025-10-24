// Qwen3模型采用Open Router的接口
export const Qwen3Model = {
  name: 'Qwen3',
  description: '通义千问，多语言能力强，高性能中文大模型',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'qwen/qwen3-235b-a22b:free',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-235b-a22b:free',
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
