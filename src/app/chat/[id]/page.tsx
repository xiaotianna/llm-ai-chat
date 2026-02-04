'use client'
import { ResponseMessage } from '@/app/api/conversation/[id]/route'
import Editor from '@/components/Editor'
import { StartIcon } from '@/components/icon/start-icon'
import { MessageItem } from '@/components/Message/MessageItem'
import { useModel } from '@/components/ModelProvider'
import { useSidebar } from '@/components/SidebarProvider'
import { SidebarTrigger } from '@/components/SidebarTrigger'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { ModelUrlMap } from '@/config/model'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useSSE } from '@/hooks/useSSE'
import { useEditorStore } from '@/store/editor'
import { addHistory } from '@/store/history'
import { MessageRoleType } from '@/types'
import { MessagesType, MessageStatus } from '@/types/model/model-config'
import { emitter } from '@/utils/emitter'
import { fetchClient } from '@/utils/fetch-client'
import {
  ParseChunkType,
  ParseDoneChunkType,
  ParseInitChunkType
} from '@/utils/parse-chunk'
import { ParseToolChunkType } from '@/utils/parse-chunk/parse-tool-plugin'
import { useTheme } from 'next-themes'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import MobileSidebar from '@/components/MobileSidebar'
import Aside from '@/components/Aside'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import ShareButton from '@/components/Share/ShareButton'

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
  {
    messages: MessagesType[]
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  }
>(({ messages, onScroll }, ref) => {
  const innerRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement)

  useEffect(() => {
    const scrollContainer = innerRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    )
    if (!scrollContainer) return

    const handleScrollEvent = (event: Event) => {
      onScroll?.(event as unknown as React.UIEvent<HTMLDivElement>)
    }

    scrollContainer.addEventListener('scroll', handleScrollEvent)

    return () => {
      scrollContainer.removeEventListener('scroll', handleScrollEvent)
    }
  }, [onScroll])

  const findMessageByNextId = (id: string) => {
    let currentMessage = messages.find((msg) => msg.id === id)
    const result = [currentMessage]
    let prevMessage = messages.find((msg) => msg.next_id === id)
    while (prevMessage) {
      result.push(prevMessage)
      prevMessage = messages.find((msg) => msg.next_id === prevMessage?.id)
    }
    return result.filter(Boolean).reverse()
  }

  const [copy] = useCopyToClipboard()

  // emitter监听copy
  useEffect(() => {
    emitter.on('copy', handleCopy)
    return () => {
      emitter.off('copy')
    }
  }, [])

  const handleCopy = (id: any) => {
    const content = findMessageByNextId(id)
      .filter((msg) => msg?.role !== 'tool')
      .map((msg) => msg?.content)
      .join('\n')
    copy(content).then(() => {
      toast.success('复制成功')
    })
  }

  // emitter监听delete-message
  useEffect(() => {
    emitter.on('delete-message', handleDelete)
    return () => {
      emitter.off('delete-message')
    }
  }, [])

  const handleDelete = (id: any) => {
    const ids = findMessageByNextId(id).map((msg) => msg!.id)
    deleteConversation(ids)
  }

  // 删除message
  const deleteConversation = async (ids: string[]) => {
    let res = await fetchClient(`/api/conversation`, {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    })
    if (res.code === 200) {
      emitter.emit('delete-conversation', ids)
      toast.success('删除成功')
    }
  }
  const isMobile = useIsMobile()

  return (
    <ScrollArea
      className='overflow-y-auto flex-1 w-full'
      ref={innerRef}
      onScroll={onScroll}
    >
      <div
        className={cn([
          'relative flex-1 p-4 pb-7 max-w-[800px] mx-auto opacity-100',
          isMobile && 'w-full'
        ])}
      >
        {messages.length > 0 &&
          messages.map((message) => (
            <MessageItem
              key={message.id}
              id={message.id}
              role={message.role as MessageRoleType}
              content={message.content}
              reasoning={message.reasoning}
              status={message.status}
              error={message.error}
              next_id={message.next_id || null}
              tool_name={message.tool_name}
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
  const [historyId, setHistoryId] = useState('')
  const { currentModel } = useModel()
  const { status: sseStatus, play, stop, error } = useSSE(
    ModelUrlMap[currentModel.provider],
    currentModel.name,
    historyId
  )
  const [messages, setMessages] = useState<MessagesType[]>([])
  const cacheMessage = useEditorStore.getState().cacheMessage
  const setCacheMessage = useEditorStore.getState().setCacheMessage
  const [isPageLoading, setIsPageLoading] = useState(false)
  const messageWrapperRef = useRef<HTMLDivElement>(null)
  const setLoading = useEditorStore.getState().setLoading
  const [autoScroll, setAutoScroll] = useState(true)
  const [subject, setSubject] = useState('')
  const { isCollapsed } = useSidebar()
  const isMobile = useIsMobile()

  useEffect(() => {
    emitter.on('update-subject', (subject: any) => {
      setSubject(subject)
    })
    return () => {
      emitter.off('update-subject')
    }
  }, [])

  useEffect(() => {
    if (id) {
      setHistoryId(id)
    }
  }, [id])

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
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll])

  const scrollToBottom = () => {
    if (messageWrapperRef.current) {
      const scrollContainer = messageWrapperRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // 判断是否接近底部（允许一定误差）
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 20
    setAutoScroll(isNearBottom)
  }

  const initConversation = async () => {
    try {
      setIsPageLoading(true)
      let res = await fetchClient<ResponseMessage>(`/api/conversation/${id}`)
      if (res.code === 200) {
        const { conversations, subject: resSubject } = res.data
        const formattedMessages = conversations.map((item) => {
          const { id, type, content, reasoning } = item
          return {
            id,
            role: type,
            content: content || '',
            reasoning: reasoning || '',
            status: 'completed' as MessageStatus,
            isDone: true,
            next_id: item.next_id || null,
            tool_name: item.tool_name || ''
          }
        })
        setSubject(resSubject)
        setMessages(formattedMessages as MessagesType[])
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
      {
        role: 'user',
        content: message,
        id: `local_${uuidv4()}`,
        status: 'streaming' as MessageStatus,
        isDone: false
      },
      {
        role: 'assistant',
        content: '',
        reasoning: '',
        id: `local_${uuidv4()}`,
        status: 'streaming' as MessageStatus,
        isDone: false
      }
    ]
    setMessages(_messages)
    setLoading(true)
    await play(
      message,
      handleGetData,
      handlePlayDone,
      handlePlayInit,
      handlePlayTool
    )
  }

  const handleGetData = (chunk: ParseChunkType[]) => {
    chunk.forEach((chunk: ParseChunkType) => {
      if (chunk.prev_id) {
        chunkUpdMsgWithPrevId(chunk)
      } else {
        chunkUpdMsg(chunk)
      }
    })
  }

  // 添加没有prev_id的消息
  const chunkUpdMsg = (chunk: ParseChunkType) => {
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
  }

  // 通用函数：处理prev_id相关的消息更新逻辑
  const handlePrevIdMessageUpdate = (
    prev_id: string,
    newMessage: Omit<MessagesType, 'id' | 'isDone' | 'status'> & { id?: string }
  ) => {
    setMessages((prev) => {
      const updated = [...prev]
      const lastMessageIndex = updated.length - 1
      const lastMessage = updated[lastMessageIndex]

      if (lastMessage && prev_id && !processedPrevIds.current.has(prev_id)) {
        // 标记已处理
        processedPrevIds.current.add(prev_id)

        const nextMessageId = `local_${uuidv4()}`
        // 修改上一条消息状态，设置为完成
        updated[lastMessageIndex] = {
          ...lastMessage,
          id: prev_id,
          next_id: nextMessageId,
          status: 'completed',
          isDone: true
        }

        // 新增一条新消息
        updated.push({
          id: nextMessageId,
          status: 'streaming',
          isDone: false,
          ...newMessage
        })
      }

      return updated
    })
  }

  // 添加有prev_id的消息
  const processedPrevIds = useRef<Set<string>>(new Set())
  const chunkUpdMsgWithPrevId = (chunk: ParseChunkType) => {
    handlePrevIdMessageUpdate(chunk.prev_id!, {
      role: 'assistant',
      content: '',
      reasoning: ''
    })
    chunkUpdMsg(chunk)
  }

  // 处理工具调用数据
  const handlePlayTool = (chunk: ParseToolChunkType) => {
    if (!chunk) return
    if (chunk.prev_id) {
      handlePrevIdMessageUpdate(chunk.prev_id, {
        role: 'tool',
        content: JSON.stringify({
          input: chunk.input,
          output: chunk.output,
          error: chunk.error
        }),
        tool_name: chunk.tool_name
      })
    }
  }

  // 接收到的终止数据，包含需要替换的消息id（user、ai）
  const handlePlayDone = (chunk: ParseDoneChunkType[]) => {
    const userMsg = chunk.find((item) => item.type === 'user')
    const aiMsg = chunk.find((item) => item.type === 'assistant')
    updateMessageDone(userMsg, aiMsg)
  }

  // 更新消息完成状态
  const updateMessageDone = (
    userMsg?: ParseDoneChunkType,
    aiMsg?: ParseDoneChunkType
  ) => {
    setMessages((prev) => {
      const updated = [...prev]
      const aiMessageIndex = updated.findLastIndex(
        (message) => message.role === 'assistant'
      )
      const userMessageIndex = updated.findLastIndex(
        (message) => message.role === 'user'
      )

      if (
        userMessageIndex >= 0 &&
        updated[userMessageIndex].role === 'user' &&
        aiMessageIndex >= 0 &&
        updated[aiMessageIndex].role === 'assistant'
      ) {
        // 更新user消息状态
        updated[userMessageIndex] = {
          ...updated[userMessageIndex],
          id:
            userMsg?.id || updated[userMessageIndex].id || `local_${uuidv4()}`,
          status: 'completed',
          isDone: true
        }
        // 更新ai消息状态
        updated[aiMessageIndex] = {
          ...updated[aiMessageIndex],
          id: aiMsg?.id || updated[aiMessageIndex].id || `local_${uuidv4()}`,
          status: 'completed',
          isDone: true
        }
      }
      return updated
    })
  }

  // 获取到historyId和标题
  const handlePlayInit = (chunk: ParseInitChunkType) => {
    if (!chunk) return
    const localId = id
    setSubject(chunk.subject)
    // 不采用router跳转，不然会刷新页面（hooks监听不到id的变化）
    window.history.replaceState({}, '', `/chat/${chunk.historyId}`)
    setHistoryId(chunk.historyId)
    // 采用emitter才监听
    emitter.emit('update-history-id', chunk.historyId)
    // 更新历史记录列表
    addHistory(localId, {
      id: chunk.historyId,
      subject: chunk.subject,
      create_time: new Date().toString()
    })
  }

  // 错误捕获：将状态设置为完成，并传递error msg
  useEffect(() => {
    if (error) {
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
            status: 'completed',
            isDone: true
          }
          // 更新ai消息状态
          updated[aiMessageIndex] = {
            ...updated[aiMessageIndex],
            status: 'error',
            isDone: true,
            error: error
          }
        }
        return updated
      })
    }
  }, [error])

  // 监听子组件MessageItem删除按钮的订阅
  useEffect(() => {
    emitter.on('delete-conversation', (event: unknown) => {
      if (typeof event === 'object' && Array.isArray(event)) {
        setMessages((prev) =>
          prev.filter((message) => !event.includes(message.id))
        )
      }
    })

    // 清理函数，组件卸载时移除事件监听器
    return () => {
      emitter.off('delete-conversation')
    }
  }, [])

  // 取消请求
  const handleStop = async () => {
    updateMessageDone()
    stop()
  }

  return (
    <div className='flex h-screen min-h-[600px] w-full relative p-[10px] duration-200 ease-[cubic-bezier(0.65,0,0.35,0)]'>
      {/* 在移动端显示抽屉触发按钮 */}
      {isMobile && (
        <div className='absolute top-4 left-4 z-10 pt-[1px]'>
          <MobileSidebar>
            <Aside />
          </MobileSidebar>
        </div>
      )}

      <div className='flex relative bg-[rgba(var(--coze-bg-11),var(--coze-bg-11-alpha))] flex-1 flex-col items-center rounded-xl shadow overflow-hidden'>
        {/* 头部 */}
        <div
          className={cn([
            'relative flex w-full items-center p-4 h-16.5',
            isMobile && 'pt-0'
          ])}
        >
          {subject && (
            <div className='flex items-center gap-[8px] max-w-[100%]'>
              <div className='overflow-hidden flex items-center'>
                {/* 在桌面端显示折叠按钮 */}
                {!isMobile && isCollapsed && (
                  <SidebarTrigger className='mr-2' />
                )}
                {isMobile && <div className='mr-6'></div>}
                <Tooltip>
                  <TooltipTrigger>
                    <h1 className='truncate max-w-2xs text-base text-[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))] font-medium'>
                      {subject || '未命名'}
                    </h1>
                  </TooltipTrigger>
                  <TooltipContent align='start'>
                    <p>{subject || '未命名'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='inline-flex items-center gap-[2px] bg-[rgba(var(--coze-bg-6),var(--coze-bg-6-alpha))] rounded-[5px] px-[4px] py-[3px] text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]'>
                <StartIcon />
                <span className='text-[12px] font-[500]'>
                  内容由 AI 生成，请仔细甄别
                </span>
              </div>
            </div>
          )}
          {/* 分享 */}
          {subject && (
            <div className='ml-auto'>
              <ShareButton sessionId={id} />
            </div>
          )}
        </div>
        {/* 聊天容器 */}
        {isPageLoading ? (
          <ChatLoading />
        ) : (
          <>
            <ChatMessageWrapper
              messages={messages}
              ref={messageWrapperRef}
              onScroll={handleScroll}
            />
            {/* 输入框 */}
            <div className='rounded-xl w-full max-w-[800px] p-4 pt-0'>
              <Editor
                onSend={handleSendMessage}
                showStop
                status={sseStatus}
                onStop={handleStop}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatHomeIdPage
