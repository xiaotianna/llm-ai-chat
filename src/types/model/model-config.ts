import { models } from '@/config/model'

export type ModelConfigKey = (typeof models)[number]['name']
export type ModelType = (typeof models)[number]

// 全部模型配置
export type ModelConfigType = {
  [key in ModelConfigKey]: ModelType
}

// 模型消息类型
export type MessagesType = {
  id: string
  role: 'system' | 'user' | 'assistant'
  content: string
  reasoning?: string
  created_time?: string
}
