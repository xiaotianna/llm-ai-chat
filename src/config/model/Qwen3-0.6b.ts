// Qwen3模型采用Open Router的接口
export const Qwen3Model = {
  name: 'Qwen3-0.6b',
  description: 'Ollama 本地 Qwen3 模型',
  url: 'http://127.0.0.1:8000/api/v1/chat/completions',
  model: 'qwen3:0.6b',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen3:0.6b',
      stream: true
    })
  },
  system_message: {},
  // 模型提供商
  provider: 'ollama'
} as const
