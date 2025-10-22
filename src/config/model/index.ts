import { ModelConfigType } from '@/types/model/model-config'
import { DeepSeekR1Model } from './DeepSeek-R1'
import { Qwen3CoderModel } from './Qwen3-Coder'
import { Qwen3Model } from './Qwen3'
import { TencentHunYuanModel } from './Hunyuan-A13B-Instruct'
import { KimiK2Model } from './Kimi-K2'
import { OpenAIGPTOSSModel } from './OpenAI-GPT-oss'
import { GLMAirModel } from './GLM-4.5-Air'

// 动态添加模型配置
export const models = [
  DeepSeekR1Model,
  Qwen3CoderModel,
  Qwen3Model,
  TencentHunYuanModel,
  KimiK2Model,
  OpenAIGPTOSSModel,
  GLMAirModel
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
