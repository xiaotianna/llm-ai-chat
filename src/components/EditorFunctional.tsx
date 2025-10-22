import React, { useState } from 'react'
import AttachmentIcon from './icon/attachment-icon'
import FunctionalButton from './FunctionalButton'
import AIModelIcon from './icon/aiModel-icon'
import FunctionalDropdown from './FunctionalDropdown'
import { models } from '@/config/model'
import { ChatType } from '@/types/model/model-config'

interface EditorFunctionalProps {
  type?: ChatType
}

const EditorFunctional: React.FC<EditorFunctionalProps> = ({
  type = 'chat'
}) => {
  const [isDeepThink, setIsDeepThink] = useState(true)
  const [isNetworkSearch, setIsNetworkSearch] = useState(true)
  return (
    <div className='flex space-x-2'>
      {/* 附件 */}
      <FunctionalButton
        tooltipNode={
          <>
            <p>上传附件（仅识别文字）</p>
            <p>最多上传 10 个，单个文件最大 50 MB</p>
          </>
        }
      >
        <AttachmentIcon />
        附件
      </FunctionalButton>
      {/* 模型切换 */}
      <FunctionalDropdown
        dropdownMenu={[
          ...models
            .filter((model) => model.type === type)
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
