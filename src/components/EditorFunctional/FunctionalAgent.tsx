import React from 'react'
import FunctionalButton from './base/FunctionalButton'
import { AgentIcon } from '../icon/agent-icon'
import { useModel } from '../ModelProvider'

const FunctionalAgent = () => {
  const { modelFunctional, updateModelFunctional } = useModel()
  const isAgent = modelFunctional.isAgent ?? true
  
  return (
    <FunctionalButton
      active={isAgent}
      handleClick={() => {
        updateModelFunctional({ isAgent: !isAgent })
      }}
      tooltipNode={'启用智能体后，才可以使用MCP功能，同时会进行多轮对话'}
      icon={<AgentIcon />}
    >
      智能体
    </FunctionalButton>
  )
}

export default FunctionalAgent