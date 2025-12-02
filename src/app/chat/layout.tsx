'use client'
import Aside from '@/components/Aside'
import { SidebarProvider, useSidebar } from '@/components/SidebarProvider'
import { useEditorStore } from '@/store/editor'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <InnerLayout children={children} />
    </SidebarProvider>
  )
}

const InnerLayout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useSidebar()
  const pathname = usePathname()
  const init = useEditorStore.getState().init
  const cacheMessage = useEditorStore.getState().cacheMessage
  const isMobile = useIsMobile()

  useEffect(() => {
    if (cacheMessage === '') {
      init()
    }
  }, [pathname])

  return (
    <div className='flex min-h-[600px] h-screen w-full'>
      {/* 在移动端隐藏侧边栏，在桌面端根据 isCollapsed 状态显示/隐藏 */}
      {!isMobile && (
        <motion.div
          animate={{ width: isCollapsed ? 0 : 280 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <Aside />
        </motion.div>
      )}
      
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  )
}

export default layout