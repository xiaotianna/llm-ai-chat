'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, CircleUserRound } from 'lucide-react'
import History from './History'
import SettingDropdown from './SettingDropdown'
import { useUserStore } from '@/store/user'

const Aside = () => {
  const [avatarLoaded, setAvatarLoaded] = useState(true)
  const router = useRouter()
  const { user } = useUserStore()

  return (
    <div className='w-[280px] h-full shrink-0 flex flex-col p-4 border-r-1 bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))]'>
      {/* logo */}
      <h1
        className='flex items-center gap-3 mb-3 cursor-pointer'
        onClick={() => router.push('/')}
      >
        <Image
          className='w-15 h-15 box-border rounded-lg'
          src={'/logo.gif'}
          alt='logo'
          width={100}
          height={100}
        />
        <span className='text-2xl font-bold italic'>AI Chat</span>
      </h1>
      {/* 新任务 按钮 */}
      <Button
        variant='outline'
        className='gap-2 w-full h-10 mb-2 border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-brand-0),var(--coze-brand-0-alpha))] hover:bg-[rgba(var(--coze-brand-2),var(--coze-brand-2-alpha))] dark:bg-[rgba(var(--coze-brand-0),var(--coze-brand-0-alpha))] dark:hover:bg-[rgba(var(--coze-brand-2),var(--coze-brand-2-alpha))] dark:border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] translate-0.5'
        onClick={() => {
          router.push('/chat')
        }}
      >
        <div className='w-full flex items-center justify-between font-bold gap-1 text-[rgba(var(--coze-brand-5),1)]'>
          <div className='flex items-center gap-1'>
            <Plus className='h-4 w-4' />
            新任务
          </div>
          <div className='ml-auto flex gap-1'>
            <div className='px-1.5 py-0.5 text-xs border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-brand-0),var(--coze-brand-0-alpha))] rounded'>
              ⌘
            </div>
            <div className='px-1.5 py-0.5 text-xs border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-brand-0),var(--coze-brand-0-alpha))] rounded'>
              K
            </div>
          </div>
        </div>
      </Button>
      <div className='relative mt-2 w-full flex-1 overflow-auto scrollbar-hide'>
        {/* 历史记录列表 */}
        <History />
      </div>
      {/* 设置 */}
      <SettingDropdown>
        <div className='p-3 flex gap-2 cursor-pointer items-center mt-auto'>
          {/* 头像 */}
          <div className='size-8 rounded-sm overflow-hidden'>
            {avatarLoaded && user?.avatar ? (
              <img
                src={user.avatar}
                alt='user-pic'
                width={32}
                height={32}
                className='w-full h-full'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/logo.png'
                  setAvatarLoaded(false)
                }}
              />
            ) : (
              <div className='w-full h-full flex justify-center items-center bg-[#4080ff]'>
                <CircleUserRound className='w-5 h-5 text-white' />
              </div>
            )}
          </div>
          {/* 用户名 */}
          <div className='flex-1 truncate text-left text-sm'>
            {user?.name || '未登录'}
          </div>
        </div>
      </SettingDropdown>
    </div>
  )
}

export default Aside
