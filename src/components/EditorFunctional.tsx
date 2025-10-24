import React from 'react'
import AIModelIcon from './icon/aiModel-icon'
import FunctionalDropdown from './FunctionalDropdown'
import { models } from '@/config/model'

const EditorFunctional: React.FC = () => {
  return (
    <div className='flex space-x-2'>
      {/* 模型切换 */}
      <FunctionalDropdown
        dropdownMenu={[
          ...models
            .map((model) => ({
              name: model.name,
              value: model.model,
              description: model.description
            }))
        ]}
        icon={<AIModelIcon />}
        currentIndex={0}
        handleSelect={(item) => {
          console.log(item)
        }}
      />
    </div>
  )
}

export default EditorFunctional
