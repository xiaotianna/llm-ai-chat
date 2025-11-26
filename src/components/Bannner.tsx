"use client"
import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Banner, BannerClose, BannerTitle } from './ui/banner'
import { useIsMobile } from '../hooks/use-mobile';

const Bannner = () => {
  const isMobile = useIsMobile()
  return (
    isMobile && <div className='w-full fixed top-0 z-50'>
      <Banner>
        <AlertCircle className='h-5 w-5 text-blue-600 dark:text-blue-400' />
        <BannerTitle>请使用桌面端访问效果最佳～🎉</BannerTitle>
        <BannerClose className='cursor-pointer' />
      </Banner>
    </div>
  )
}

export default Bannner
