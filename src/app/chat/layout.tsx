'use client'
import Aside from '@/components/Aside'
import { SidebarProvider, useSidebar } from '@/components/SidebarProvider'
import { SidebarTrigger } from '@/components/SidebarTrigger'
import { useEditorStore } from '@/store/editor'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    if (cacheMessage === '') {
      init()
    }
  }, [pathname])

  return (
    <div className='flex min-h-[600px] h-screen w-full'>
      <motion.div
        animate={{ width: isCollapsed ? 0 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Aside />
      </motion.div>
      {children}
    </div>
  )
}

export default layout