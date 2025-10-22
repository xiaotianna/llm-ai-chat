// Kimi K2模型采用Open Router的接口
export const KimiK2Model = {
  name: 'Kimi K2',
  description: '月之暗面新一代大模型，超长文本处理能力，中英文对话流畅',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'moonshotai/kimi-k2:free',
  type: 'chat',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2:free',
      stream: true
    })
  },
  system_message: {
    role: 'system',
    content: 'You are a helpful assistant.'
  },
  // 模型提供商
  provider: 'open-router',
  // sse数据标识
  prefix: 'data: ',
  // 结束标识
  doneFlage: '[DONE]'
} as const
