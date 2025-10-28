import React from 'react'
import { Button } from './ui/button'
import { useSidebar } from './SidebarProvider'
import { PanelLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SidebarTrigger = ({ className, ...props }: React.ComponentProps<typeof Button>) => {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      data-sidebar='trigger'
      data-slot='sidebar-trigger'
      variant='ghost'
      size='icon'
      className={cn(
        'size-8 ml-auto hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]',
        className
      )}
      {...props}
      onClick={(event) => {
        toggleSidebar()
      }}
    >
      <PanelLeftIcon />
      <span className='sr-only'>折叠侧边栏</span>
    </Button>
  )
}
