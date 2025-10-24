import React, { useState } from 'react'
import AIModelIcon from './icon/aiModel-icon'
import FunctionalDropdown from './FunctionalDropdown'
import { models } from '@/config/model'
import { ChatType } from '@/types/model/model-config'

interface EditorFunctionalProps {
  type?: ChatType
}

const EditorFunctional: React.FC<EditorFunctionalProps> = () => {
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
