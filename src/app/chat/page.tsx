'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Editor from '@/components/Editor'
import { useUserStore } from '@/store/user'
import { toast } from 'sonner'
import { useEditorStore } from '@/store/editor'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/SidebarTrigger'
import { useSidebar } from '@/components/SidebarProvider'
import { addHistory } from '@/store/history'

const ChatHome = () => {
  const { user } = useUserStore()
  const [content, setContent] = useState<string>('')
  const { setLoading, setCacheMessage } = useEditorStore()
  const router = useRouter()

  const handleInput = (value: string) => {
    setContent(value)
  }

  const handleSendMessage = () => {
    if (content.length > 3000) {
      return toast.error('消息长度不能超过3000字')
    }
    // 生成一个随机ID记录临时会话
    const id = `local_${uuidv4()}`
    setLoading(true)
    setCacheMessage(content)
    router.push(`/chat/${id}`)
    // 添加到历史记录中
    addHistory(id, {
      id,
      subject: '新会话',
      create_time: new Date().toString()
    })
  }
  const { isCollapsed } = useSidebar()
  return (
    <div
      className={`flex h-screen w-full flex-col items-center justify-center overflow-hidden relative`}
    >
      {/* 背景色 */}
      <div className='absolute top-[100px] left-[40px] right-[40px] bottom-[0] z-[-1] bg-[linear-gradient(74deg,rgba(81,71,255,0.12)_27.4%,rgba(125,246,255,0.12)_59.39%)] rounded-[1800px] blur-[130px]'></div>
      <div className='flex w-full grow p-[7px] relative'>
        {/* 折叠按钮 */}
        {!isCollapsed ? null : <SidebarTrigger className='mr-2' />}
        {/* 显示容器 */}
        <div className='relative min-h-[600px] flex-1 flex flex-col items-center justify-center p-8 rounded'>
          <div className='z-0 flex -mt-10 flex-col justify-center items-center w-full max-w-[800px] mx-auto relative'>
            {/* 欢迎语 和 果冻小图 */}
            <div className='flex items-center justify-between w-full'>
              <h1 className='text-[38px] font-semibold text-[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))'>
                你好，{user?.name || '欢迎来到AI Chat'}
              </h1>
              <Image
                src={'/jelly.png'}
                width={100}
                height={38}
                alt='jelly-picture'
                className='w-[160px] mr-[38px] self-end'
              />
            </div>
            {/* 输入框 */}
            <div className='w-full mb-6'>
              <Editor
                onSend={handleSendMessage}
                onInput={handleInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatHome
