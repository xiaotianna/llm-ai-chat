import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

const TooltipComp = ({
  active,
  children,
  tooltipNode,
  icon,
  handleClick,
  ...props
}: {
  active: boolean
  children: React.ReactNode
  tooltipNode?: React.ReactNode | string
  icon?: React.ReactNode
  handleClick?: (e: React.MouseEvent) => void
  [key: string]: any
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          data-slot='button'
          className={`${
            active
              ? "justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer transition px-4 has-[>svg]:px-3 h-[32px] flex rounded-[100px] items-center gap-1 py-1 border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-brand-0),var(--coze-brand-0-alpha))] text-[rgba(var(--coze-fg-3), var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-brand-0),var(--coze-brand-3-alpha))] text-[rgba(var(--coze-brand-5),1)]"
              : "justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-45 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4.5 shrink-0 [&amp;_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer transition px-4 has-[>svg]:px-3 h-[32px] flex rounded-[100px] items-center gap-1 py-1 border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3), var(--coze-bg-3-alpha))] text-[rgba(var(--coze-fg-3), var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]"
          }`}
          onClick={(e) => handleClick && handleClick(e)}
          {...props}
        >
          {children}
        </div>
      </TooltipTrigger>
      {tooltipNode && (
        <TooltipContent>
          {typeof tooltipNode === 'string' ? <p>{tooltipNode}</p> : tooltipNode}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

interface FunctionalButtonProps {
  active?: boolean
  tooltipNode?: string | React.ReactNode
  icon?: React.ReactNode
  children: React.ReactNode
  handleClick?: (e: React.MouseEvent) => void
  [key: string]: any
}

const FunctionalButton = ({
  active = false,
  tooltipNode = '',
  icon,
  children,
  handleClick,
  ...props
}: FunctionalButtonProps) => {
  return (
    <TooltipComp
      active={active}
      {...props}
      tooltipNode={tooltipNode}
      handleClick={handleClick}
    >
      {icon}
      {typeof children === 'string' ? (
        <span className='font-medium text-sm inline-block'>{children}</span>
      ) : (
        children
      )}
    </TooltipComp>
  )
}

export default FunctionalButton
