export const MiniMax2_5 = {
  name: 'MiniMax-2.5',
  description: 'MiniMax推出的2.5系列模型',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'minimax/minimax-m2.5:free',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'minimax/minimax-m2.5:free',
      stream: true
    })
  },
  system_message: {},
  // 模型提供商
  provider: 'openai',
  function: {}
} as const
