// 腾讯Hunyuan-A13B-Instruct模型采用Open Router的接口
export const TencentHunYuanModel = {
  name: 'Hunyuan',
  description: '腾讯混元大模型，中文理解能力强，适合复杂指令执行',
  url: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'tencent/hunyuan-a13b-instruct:free',
  requestConfig: {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tencent/hunyuan-a13b-instruct:free',
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
