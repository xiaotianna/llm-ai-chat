export const DeepSeekModel = {
  name: 'DeepSeek-v3.2',
  description: '深度求索研发的高性能模型，逻辑推理和代码生成能力强',
  model: 'deepseek-v3.2:cloud',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-v3.2:cloud',
      stream: true
    })
  },
  system_message: {},
  // 模型提供商
  provider: 'ollama',
  function: { tools: true, agent: true }
} as const
