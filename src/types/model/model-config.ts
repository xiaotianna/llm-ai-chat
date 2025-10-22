import { models } from '@/config/model'

export type ModelConfigKey = (typeof models)[number]['name']
export type ModelType = (typeof models)[number]

// 全部模型配置
export type ModelConfigType = {
  [key in ModelConfigKey]: ModelType
}

// 模型消息类型
export type MessagesType = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 对话类型
export type ChatType = 'chat' | 'image' | 'code'
