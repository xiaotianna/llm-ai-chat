import React from 'react'
import AIModelIcon from '../icon/aiModel-icon'
import FunctionalDropdown from './FunctionalDropdown'
import { models } from '@/config/model'
import { useModel } from '@/components/ModelProvider'

const EditorFunctional: React.FC = () => {
  const { currentModel, setCurrentModel } = useModel()
  const currentModelIndex = models.findIndex(model => model.model === currentModel.model)
  
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
          const model = models.find((model) => model.model === item.value)
          if (model) {
            setCurrentModel(model)
          }
        }}
      />
    </div>
  )
}

export default EditorFunctional