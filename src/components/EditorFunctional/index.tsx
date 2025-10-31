import React, { useEffect, useMemo, useState } from 'react'
import AIModelIcon from '../icon/aiModel-icon'
import FunctionalDropdown from './FunctionalDropdown'
import { models } from '@/config/model'
import FunctionalButton from './FunctionalButton'
import { NetworkIcon } from '../icon/network-icon'
import { ToolsIcon } from '../icon/tools-icon'

export interface FunctionalFeatureConfig {
  key: string
  name: string
  icon: React.ReactNode
  tooltipNode: string
  initialState: boolean
}

export const functionalFeatures: Record<string, FunctionalFeatureConfig> = {
  webSearch: {
    key: 'webSearch',
    name: '联网搜索',
    icon: <NetworkIcon />,
    tooltipNode: '实时联网查询，获取最新信息',
    initialState: true
  },
  functionCalling: {
    key: 'functionCalling',
    name: '函数调用',
    icon: <ToolsIcon />,
    tooltipNode: '启用函数调用能力',
    initialState: false
  }
}

export const getEnabledFeaturesForModel = (model: any): string[] => {
  return Object.keys(functionalFeatures).filter((featureKey) => {
    // 如果模型配置中该功能明确设置为 false，则不启用
    if (featureKey in model) {
      return model[featureKey as keyof typeof model] !== false
    }
    // 默认启用
    return true
  })
}

const EditorFunctional: React.FC = () => {
  const [currentModelIndex, setCurrentModelIndex] = useState(0)
  const [featureStates, setFeatureStates] = useState<Record<string, boolean>>({
    webSearch: true,
    functionCalling: false
  })

  const currentModel = models[currentModelIndex]
  // 计算当前模型启用的功能
  const enabledFeatures = useMemo(() => {
    return getEnabledFeaturesForModel(currentModel)
  }, [currentModelIndex, currentModel])

  // 切换功能状态
  const toggleFeature = (featureKey: string) => {
    setFeatureStates((prev) => ({
      ...prev,
      [featureKey]: !prev[featureKey]
    }))
  }
  return (
    <div className='flex space-x-2'>
      {/* 模型切换 */}
      <FunctionalDropdown
        dropdownMenu={[
          ...models.map((model) => ({
            name: model.name,
            value: model.model,
            description: model.description
          }))
        ]}
        icon={<AIModelIcon />}
        currentIndex={currentModelIndex}
        handleSelect={(item) => {
          const index = models.findIndex((model) => model.model === item.value)
          if (index !== -1) {
            setCurrentModelIndex(index)
          }
        }}
      />
      {/* 根据模型配置动态渲染功能按钮 */}
      {enabledFeatures.map((featureKey) => {
        const config = functionalFeatures[featureKey]
        if (!config) return null

        return (
          <FunctionalButton
            key={featureKey}
            active={featureStates[featureKey] ?? config.initialState}
            tooltipNode={config.tooltipNode}
            handleClick={() => toggleFeature(featureKey)}
            icon={config.icon}
          >
            {config.name}
          </FunctionalButton>
        )
      })}
    </div>
  )
}

export default EditorFunctional
