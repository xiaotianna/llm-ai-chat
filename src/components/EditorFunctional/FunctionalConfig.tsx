import { models } from '@/config/model'
import FunctionalTools from './FunctionalTools'
import FunctionalAgent from './FunctionalAgent'

type GetAllFunctionKeys<T> = T extends readonly (infer U)[]
  ? U extends { function: infer F }
    ? keyof F
    : never
  : never

// "tools" | "agent"
export type FunctionalConfigKey = GetAllFunctionKeys<typeof models>

export interface FunctionalConfigValueType {
  key: string
  name: string
  component: React.ComponentType<any> | React.ReactNode
}

// 额外的一些模型支持的配置
export const FunctionalConfig: Record<
  FunctionalConfigKey,
  FunctionalConfigValueType
> = {
  tools: {
    key: 'tools',
    name: 'MCP工具',
    component: FunctionalTools
  },
  agent: {
    key: 'agent',
    name: '智能体',
    component: FunctionalAgent
  }
}
