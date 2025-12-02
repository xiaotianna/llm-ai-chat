'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { models } from '@/config/model'
import { ModelType } from '@/types/model/model-config'

// 定义模型功能状态的类型
interface ModelFunctionalState {
  isAgent?: boolean
}

// 定义上下文的类型
interface ModelContextType {
  currentModel: ModelType
  setCurrentModel: (model: ModelType) => void
  setCurrentModelIndex: (index: number) => void
  modelFunctional: ModelFunctionalState
  setModelFunctional: (functional: ModelFunctionalState) => void
  updateModelFunctional: (updates: Partial<ModelFunctionalState>) => void
}

// 创建上下文
const ModelContext = createContext<ModelContextType | undefined>(undefined)

// 创建 Provider 组件
export const ModelProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [currentModelIndex, setCurrentModelIndex] = useState(0)
  const [modelFunctional, setModelFunctionalState] =
    useState<ModelFunctionalState>({
      isAgent: false // 默认启用智能体
    })

  const currentModel = models[currentModelIndex]

  const setCurrentModel = (model: ModelType) => {
    const index = models.findIndex((m) => m.model === model.model)
    if (index !== -1) {
      setCurrentModelIndex(index)
    }
  }

  // 更新模型功能状态的方法
  const updateModelFunctional = (updates: Partial<ModelFunctionalState>) => {
    setModelFunctionalState((prev) => ({
      ...prev,
      ...updates
    }))
  }

  // 设置整个模型功能状态的方法
  const setModelFunctional = (functional: ModelFunctionalState) => {
    setModelFunctionalState(functional)
  }

  return (
    <ModelContext.Provider
      value={{
        currentModel,
        setCurrentModel,
        setCurrentModelIndex,
        modelFunctional,
        setModelFunctional,
        updateModelFunctional
      }}
    >
      {children}
    </ModelContext.Provider>
  )
}

// 创建自定义 hook 用于访问上下文
export const useModel = () => {
  const context = useContext(ModelContext)
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider')
  }
  return context
}
