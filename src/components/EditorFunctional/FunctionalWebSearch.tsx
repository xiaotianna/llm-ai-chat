import React from 'react'
import FunctionalButton from './base/FunctionalButton'
import { NetworkIcon } from '../icon/network-icon'

const FunctionalWebSearch = () => {
  const [isSearch, setIsSearch] = React.useState(false)
  return (
    <FunctionalButton
      active={isSearch}
      handleClick={() => {
        setIsSearch(!isSearch)
      }}
      tooltipNode={'启用Web搜索能力'}
      icon={<NetworkIcon />}
    >
      联网搜索
    </FunctionalButton>
  )
}

export default FunctionalWebSearch
