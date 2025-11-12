import React from 'react'
import FunctionalButton from './base/FunctionalButton'
import { AgentIcon } from '../icon/agent-icon'

const FunctionalAgent = () => {
  const [isAgent, setIsAgent] = React.useState(true)
  return (
    <FunctionalButton
      active={isAgent}
      handleClick={() => {
        setIsAgent(!isAgent)
      }}
      tooltipNode={'启用智能体后，才可以使用MCP功能，同时会进行多轮对话'}
      icon={<AgentIcon />}
    >
      智能体
    </FunctionalButton>
  )
}

export default FunctionalAgent
