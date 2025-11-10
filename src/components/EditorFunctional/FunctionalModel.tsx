import { models } from '@/config/model'
import React from 'react'
import AIModelIcon from '../icon/aiModel-icon'
import { useModel } from '../ModelProvider'
import FunctionalDropdown from './base/FunctionalDropdown'

const FunctionalModel = () => {
  const { currentModel, setCurrentModel } = useModel()
  const currentModelIndex = models.findIndex(
    (model) => model.model === currentModel.model
  )
  return (
    // 模型切换
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
        const model = models.find((model) => model.model === item.value)
        if (model) {
          setCurrentModel(model)
        }
      }}
    />
  )
}

export default FunctionalModel
