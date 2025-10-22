import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import SelectedIcon from './icon/selected-icon'
import DownIcon from './icon/down-icon'
import { useState } from 'react'

interface DropdownMenuItemType {
  name: string
  value: string
  description: string
}

interface FunctionalDropdownProps {
  icon?: React.ReactNode
  currentIndex?: number
  dropdownMenu: DropdownMenuItemType[]
  handleSelect?: (item: DropdownMenuItemType) => void
  [key: string]: any
}

const FunctionalDropdown = ({
  icon,
  currentIndex = 0,
  dropdownMenu,
  handleSelect,
  ...props
}: FunctionalDropdownProps) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex)
  return (
    <DropdownMenu {...props}>
      <DropdownMenuTrigger>
        <div
          data-slot='button'
          className="justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-45 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4.5 shrink-0 [&amp;_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer transition has-[>svg]:px-3 flex h-[32px] rounded-[100px] items-center gap-1 px-3 py-1 border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3), var(--coze-bg-3-alpha))] text-[rgba(var(--coze-fg-3), var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]"
        >
          {icon}
          <span className='font-medium text-sm'>
            {dropdownMenu[activeIndex].name}
          </span>
          <DownIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        side='bottom'
        avoidCollisions={false}
        className='flex border cursor-pointer w-[420px] rounded-lg flex-col p-1 gap-0.5 max-h-60'
      >
        {dropdownMenu.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => {
              const index = dropdownMenu.findIndex(
                (i) => i.value === item.value
              )
              setActiveIndex(index)
              handleSelect && handleSelect(item)
            }}
          >
            <button className='w-full flex items-center cursor-pointer gap-3 rounded-sm transition-colors'>
              {icon}
              <div className='flex-1 text-left'>
                <div className='text-sm text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] font-medium'>
                  {item.name}
                </div>
                <div className='text-xs text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
                  {item.description}
                </div>
              </div>
              {dropdownMenu[activeIndex].value === item.value && (
                <SelectedIcon />
              )}
            </button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FunctionalDropdown
