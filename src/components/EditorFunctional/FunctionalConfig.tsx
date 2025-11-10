import { models } from '@/config/model'
import { ToolsIcon } from '../icon/tools-icon'
import FunctionalButton from './FunctionalButton'

type GetAllFunctionKeys<T> = T extends readonly (infer U)[]
  ? U extends { function: infer F }
    ? keyof F
    : never
  : never

// "functionCalling" | "webSearch"
export type FunctionalConfigKey = GetAllFunctionKeys<typeof models>

export interface FunctionalConfigValueType {
  key: string
  name: string
  icon: React.ReactNode
  tooltipNode: string
  component: React.ComponentType<any> | React.ReactNode
}

export const FunctionalConfig: Record<
  FunctionalConfigKey,
  FunctionalConfigValueType
> = {
  functionCalling: {
    key: 'functionCalling',
    name: 'MCP',
    icon: <ToolsIcon />,
    tooltipNode: '启用MCP调用能力',
    component: <div>hello mcp</div>
  },
  webSearch: {
    key: 'webSearch',
    name: '联网搜索',
    icon: <ToolsIcon />,
    tooltipNode: '启用Web搜索能力',
    component: FunctionalButton
  }
}
