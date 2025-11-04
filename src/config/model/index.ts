import { ModelConfigType } from '@/types/model/model-config'
import { Qwen3Model } from './Qwen3-0.6b'
import { DeepSeekR1Model } from './DeepSeek-R1'

// 动态添加模型配置
export const models = [Qwen3Model, DeepSeekR1Model] as const

// 全部模型配置
/**
 * 数据结构：
 * {
 *   'modelName1': {},
 *   'modelName2': {},
 * }
 */
export const ModelConfig: ModelConfigType = Object.fromEntries(
  models.map((model) => [model.name, model])
) as ModelConfigType

export type ModelName = (typeof models)[number]['name']

// 模型请求url
export const ModelUrlMap: Record<(typeof models)[number]['provider'], string> = {
  'open-router': '/api/chat',
  'ollama': '/api/chat/ollama'
} as const
