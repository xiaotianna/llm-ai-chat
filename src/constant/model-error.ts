export const OPEN_ROUTER_ERROR_CODE = {
  400: '错误请求（无效或缺少参数，CORS）',
  401: '凭证无效（OAuth 会话过期，禁用/无效的 API 密钥）',
  402: '您的账户或 API 密钥余额不足。请添加更多余额后重试请求。',
  403: '您选择的模型需要审核，您的输入已被标记',
  408: '您的请求超时',
  429: '您已被速率限制',
  502: '您选择的模型已宕机或我们收到了来自它的无效响应',
  503: '没有可用的模型提供者满足您的路由需求'
} as const

// 错误码
export const PROVIDER_ERROR_CODES = {
  'open-router': OPEN_ROUTER_ERROR_CODE
} as const
