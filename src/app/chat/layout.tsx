'use client'
import Aside from '@/components/Aside'
import { useEditorStore } from '@/store/editor'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
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
      <Aside />
      {children}
    </div>
  )
}

export default layout
