import { ModelConfigType } from '@/types/model/model-config'
import { Qwen3Model } from './Qwen3-0.6b'
import { Qwen3_5CloudModel } from './Qwen3.5-Cloud'
import { DeepSeekModel } from './DeepSeek'
import { MiniMax2_5 } from './MiniMax2.5'

// 动态添加模型配置
export const models = [
  DeepSeekModel,
  Qwen3Model,
  Qwen3_5CloudModel,
  MiniMax2_5
] as const

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
export const ModelUrlMap: Record<(typeof models)[number]['provider'], string> =
  {
    openai: '/api/chat',
    ollama: '/api/chat/ollama'
  } as const
