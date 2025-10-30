// DeepSeek-R1模型采用Open Router的接口
export const DeepSeekR1Model = {
  name: 'DeepSeek-R1',
  description: '深度求索研发的高性能模型，逻辑推理和代码生成能力强',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'tngtech/deepseek-r1t2-chimera:free',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tngtech/deepseek-r1t2-chimera:free',
      stream: true
    })
  },
  system_message: {},
  // 模型提供商
  provider: 'open-router',
  functionCalling: true,
  webSearch: false
} as const
