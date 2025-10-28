'use client'
import { ResponseMessage } from '@/app/api/conversation/[id]/route'
import Editor from '@/components/Editor'
import { MessageItem } from '@/components/MessageItem'
import { useSidebar } from '@/components/SidebarProvider'
import { SidebarTrigger } from '@/components/SidebarTrigger'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useSSE } from '@/hooks/useSSE'
import { useEditorStore } from '@/store/editor'
import { MessageRoleType } from '@/types'
import { MessagesType } from '@/types/model/model-config'
import { emitter } from '@/utils/emitter'
import { fetchClient } from '@/utils/fetch-client'
import { ParseChunkType, ParseDoneChunkType } from '@/utils/parse-chunk'
import { useTheme } from 'next-themes'
import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

// 聊天消息为空展示内容
const ChatLoading = () => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 在组件挂载前返回一致的占位内容
  if (!mounted) {
    return (
      <div className='flex items-center coz-fg-hglt justify-center h-full flex-col'>
        <div className='w-20 h-20 flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      </div>
    )
  }

  // 组件挂载后根据主题显示对应内容
  return (
    <div className='flex items-center coz-fg-hglt justify-center h-full flex-col'>
      <img
        src={`/logo-loading-${resolvedTheme}.gif`}
        alt='logo-loading'
        className='w-20 h-20 pointer-events-none select-none'
      />
    </div>
  )
}

// 对话容器
const ChatMessageWrapper = forwardRef<
  HTMLDivElement,
  { messages: MessagesType[] }
>(({ messages }, ref) => {
  return (
    <ScrollArea
      className='overflow-y-auto flex-1 w-full'
      ref={ref}
    >
      <div className='relative flex-1 p-4 pb-7 max-w-[800px] max-md:w-[100vw] mx-auto opacity-100'>
        {messages.length > 0 &&
          messages.map((message) => (
            <MessageItem
              key={message.id}
              id={message.id}
              role={message.role as MessageRoleType}
              content={message.content}
              reasoning={message.reasoning}
              isDone={message.isDone}
            />
          ))}
      </div>
      {/* 占位 */}
      <div className='h-4'></div>
      <div className='h-4 w-full absolute left-0 bottom-0 bg-gradient-to-t from-[rgba(var(--coze-bg-11),1)] to-transparent'></div>
    </ScrollArea>
  )
})

const ChatHomeIdPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params)
  // TODO stop功能
  const { isDone, play, stop } = useSSE('/api/chat', 'DeepSeek-R1', id)
  const [messages, setMessages] = useState<MessagesType[]>([])
  const init = useEditorStore.getState().init
  const cacheMessage = useEditorStore.getState().cacheMessage
  const setCacheMessage = useEditorStore.getState().setCacheMessage
  const [isPageLoading, setIsPageLoading] = useState(false)
  const messageWrapperRef = useRef<HTMLDivElement>(null)
  const setLoading = useEditorStore.getState().setLoading

  useEffect(() => {
    // 初始化执行，动态路由：以local_开头的id为临时会话，并且缓存消息不为空
    if (
      id.startsWith('local_') &&
      messages.length === 0 &&
      cacheMessage !== ''
    ) {
      handleSendMessage(cacheMessage)
      // 发送缓存消息后立即清除，防止重复发送
      setCacheMessage('')
    } else if (!id.startsWith('local_')) {
      // 加载之前的会话
      initConversation()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    // TODO 如果用户滚动就不到底部
    if (messageWrapperRef.current) {
      const scrollContainer = messageWrapperRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const initConversation = async () => {
    try {
      setIsPageLoading(true)
      let res = await fetchClient<ResponseMessage[]>(`/api/conversation/${id}`)
      if (res.code === 200) {
        const formattedMessages = res.data.map((item) => {
          const { id, type, content, reasoning } = item
          return {
            id,
            role: type,
            content: content || '',
            reasoning: reasoning || '',
            isDone: true
          }
        })
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('加载失败')
    } finally {
      setIsPageLoading(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    const _messages: MessagesType[] = [
      ...messages,
      { role: 'user', content: message, id: uuidv4(), isDone: false },
      {
        role: 'assistant',
        content: '',
        reasoning: '',
        id: uuidv4(),
        isDone: false
      }
    ]
    setMessages(_messages)
    setLoading(true)
    await play(message, handleGetData, handlePlayDone)
  }

  const handleGetData = (chunk: ParseChunkType[]) => {
    chunk.forEach((chunk: ParseChunkType) => {
      setMessages((prev) => {
        const updated = [...prev]
        const lastMessage = updated[updated.length - 1]

        if (lastMessage && lastMessage.role === 'assistant') {
          let newContent = lastMessage.content || ''
          let newReasoning = lastMessage.reasoning || ''

          if (chunk.type === 'content') {
            newContent += chunk.content
          } else if (chunk.type === 'reasoning') {
            newReasoning += chunk.content
          }

          updated[updated.length - 1] = {
            ...lastMessage,
            content: newContent,
            reasoning: newReasoning
          }
        }

        return updated
      })
    })
  }

  // 接收到的终止数据，包含需要替换的消息id（user、ai）
  const handlePlayDone = (chunk: ParseDoneChunkType[]) => {
    console.log(chunk)
    const userMsg = chunk.find((item) => item.type === 'user')
    const aiMsg = chunk.find((item) => item.type === 'assistant')
    setMessages((prev) => {
      const updated = [...prev]
      const aiMessageIndex = updated.length - 1
      const userMessageIndex = updated.length - 2

      if (
        userMessageIndex >= 0 &&
        updated[userMessageIndex].role === 'user' &&
        aiMessageIndex >= 0 &&
        updated[aiMessageIndex].role === 'assistant'
      ) {
        // 更新user消息状态
        updated[userMessageIndex] = {
          ...updated[userMessageIndex],
          id: userMsg?.id || uuidv4(),
          isDone: true
        }
        // 更新ai消息状态
        updated[aiMessageIndex] = {
          ...updated[aiMessageIndex],
          id: aiMsg?.id || uuidv4(),
          isDone: true
        }
      }
      return updated
    })
  }

  // 监听子组件MessageItem删除按钮的订阅
  useEffect(() => {
    emitter.on('delete-conversation', (event: unknown) => {
      // 确保 event 是 string 类型
      if (typeof event === 'string') {
        setMessages((prev) => prev.filter((message) => message.id !== event))
      }
    })

    // 清理函数，组件卸载时移除事件监听器
    return () => {
      emitter.off('delete-conversation')
    }
  }, [])

  useEffect(() => {
    if (isDone) {
      // 重置状态
      init()
    }
  }, [isDone])

  const { isCollapsed } = useSidebar()

  return (
    <div className='flex h-screen min-h-[600px] w-full relative p-[10px] duration-200 ease-[cubic-bezier(0.65,0,0.35,0)]'>
      <div className='flex relative bg-[rgba(var(--coze-bg-11),var(--coze-bg-11-alpha))] flex-1 flex-col items-center rounded-xl shadow overflow-hidden'>
        {/* 头部 */}
        <div className='relative flex w-full items-center p-4 h-16.5'>
          <div className='flex items-center gap-[8px] max-w-[100%]'>
            <div className='overflow-hidden flex items-center'>
              {!isCollapsed ? null : <SidebarTrigger className='mr-2' />}
              <Tooltip>
                <TooltipTrigger>
                  <h1 className='truncate max-w-2xs text-base text-[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))] font-medium'>
                    未命名
                  </h1>
                </TooltipTrigger>
                <TooltipContent align='start'>
                  <p>未命名</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className='inline-flex items-center gap-[2px] bg-[rgba(var(--coze-bg-6),var(--coze-bg-6-alpha))] rounded-[5px] px-[4px] py-[3px] text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]'>
              <svg
                className='font-icon font-icon-coz_Automatic w-[14px] h-[14px]'
                width='1em'
                height='1em'
                viewBox='0 0 24 24'
                fill='currentColor'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M6.98669 10.3442C7.29854 9.50142 8.49053 9.50142 8.80238 10.3442L9.65735 12.6547C9.7554 12.9197 9.9643 13.1286 10.2293 13.2266L12.5398 14.0816C13.3826 14.3935 13.3826 15.5854 12.5398 15.8973L10.2293 16.7523C9.9643 16.8503 9.7554 17.0592 9.65735 17.3242L8.80238 19.6347C8.49053 20.4775 7.29854 20.4775 6.98669 19.6347L6.13171 17.3242C6.03367 17.0592 5.82476 16.8503 5.5598 16.7523L3.24926 15.8973C2.4065 15.5854 2.4065 14.3935 3.24926 14.0816L5.5598 13.2266C5.82476 13.1286 6.03367 12.9197 6.13171 12.6547L6.98669 10.3442zM19.4427 10.9871C20.4203 12.5236 21.0916 14.0809 21.3744 15.5145 21.7145 17.239 21.5193 18.9799 20.3392 20.16 19.4795 21.0196 18.3098 21.3577 17.0863 21.3445 15.8683 21.3314 14.5283 20.9743 13.1839 20.3641 12.6814 20.1356 12.4587 19.5426 12.6869 19.0399 12.9151 18.5371 13.5083 18.3137 14.0111 18.5418 15.1866 19.0754 16.2471 19.3362 17.1078 19.3455 17.963 19.3547 18.5509 19.12 18.9252 18.7459 19.4338 18.2373 19.6891 17.3087 19.4115 15.9012 19.2445 15.0548 18.8916 14.1055 18.3636 13.1092 18.5977 12.934 18.7916 12.6886 18.9095 12.3699L19.4164 10.9979 19.4427 10.9871z'
                  fillOpacity='1'
                ></path>
                <path
                  d='M3.83824 3.659C5.0184 2.47884 6.76013 2.28459 8.48472 2.62482 10.2312 2.96939 12.1616 3.88957 14.014 5.23907 14.4603 5.56426 14.5588 6.19019 14.2337 6.63653 13.9086 7.08276 13.2826 7.18127 12.8363 6.85626 11.148 5.62631 9.48349 4.86117 8.09801 4.58771 6.69068 4.31007 5.76203 4.56461 5.25328 5.07306 4.62397 5.7024 4.39245 6.99164 5.03746 8.92657 5.16015 9.29461 5.31224 9.67423 5.49156 10.0623L4.80992 11.9051 4.29137 12.0965C3.80187 11.238 3.4149 10.3839 3.14 9.55939 2.41988 7.39913 2.38478 5.11264 3.83824 3.659zM16.835 6.15714C17.0238 5.6471 17.7451 5.6471 17.9339 6.15714L18.4513 7.55546C18.5106 7.71582 18.6371 7.84225 18.7974 7.90158L20.1957 8.41901C20.7058 8.60774 20.7058 9.32912 20.1957 9.51785L18.7974 10.0353C18.6371 10.0946 18.5106 10.221 18.4513 10.3814L17.9339 11.7797C17.7451 12.2898 17.0238 12.2898 16.835 11.7797L16.3176 10.3814C16.2583 10.221 16.1318 10.0946 15.9715 10.0353L14.5731 9.51785C14.0631 9.32912 14.0631 8.60774 14.5731 8.41901L15.9715 7.90158C16.1318 7.84225 16.2583 7.71582 16.3176 7.55546L16.835 6.15714z'
                  fillOpacity='1'
                ></path>
              </svg>
              <span className='text-[12px] font-[500]'>
                内容由 AI 生成，请仔细甄别
              </span>
            </div>
          </div>
        </div>
        {/* 聊天容器 */}
        {isPageLoading ? (
          <ChatLoading />
        ) : (
          <>
            <ChatMessageWrapper
              messages={messages}
              ref={messageWrapperRef}
            />
            {/* 输入框 */}
            <div className='rounded-xl w-full max-w-[800px] p-4 pt-0'>
              <Editor onSend={handleSendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatHomeIdPage
