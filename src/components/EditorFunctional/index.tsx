import React, { useEffect } from 'react'
import FunctionalModel from './FunctionalModel'
import { useModel } from '../ModelProvider'
import { FunctionalConfig, FunctionalConfigKey } from './FunctionalConfig'

const EditorFunctional: React.FC = () => {
  const { currentModel } = useModel()
  return (
    <div className='flex space-x-2'>
      {/* 模型切换 */}
      <FunctionalModel />
      {/* 其他配置 */}
      {Object.keys(currentModel.function).map((key) => {
        const configKey = key as FunctionalConfigKey
        const Component = FunctionalConfig[configKey]
          .component as React.ComponentType<any>
        return <Component key={key} />
      })}
    </div>
  )
}

export default EditorFunctional
