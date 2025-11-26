'use client'

import React, { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface MobileSidebarProps {
  children: React.ReactNode
}

const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const [open, setOpen] = useState(false)

  // 监听自定义事件来关闭侧边栏
  useEffect(() => {
    const closeSidebar = () => setOpen(false)
    window.addEventListener('close-mobile-sidebar', closeSidebar)
    return () => {
      window.removeEventListener('close-mobile-sidebar', closeSidebar)
    }
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTitle className='sr-only'>侧边栏</SheetTitle>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">打开侧边栏</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        {children}
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar