export const Qwen3_5CloudModel = {
  name: 'Qwen3.5-Cloud',
  description: 'Ollama云端Qwen3.5满血模型',
  model: 'qwen3.5:397b-cloud',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen3.5:397b-cloud',
      stream: true
    })
  },
  system_message: {},
  // 模型提供商
  provider: 'ollama',
  function: {
    tools: true,
    agent: true
  }
} as const
