import Aside from '@/components/Aside'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex min-h-[600px] h-screen w-full'>
      <Aside />
      {children}
    </div>
  )
}

export default layout
