// Qwen3 Coder模型采用Open Router的接口
export const Qwen3CoderModel = {
  name: 'Qwen3 Coder',
  description: '通义千问代码专家模型，专为编程任务优化，代码生成能力突出',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'qwen/qwen3-coder:free',
  type: 'chat',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen3-coder:free',
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
