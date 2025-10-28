import React, { useState } from 'react'
import { MessageRoleType } from '@/types'
import MarkdownRender from './MarkdownRender'
import { Copy, Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger
} from './ui/shadcn-io/ai/reasoning'
import ShinyText from './ui/shiny-text'
import DotLoading from './DotLoading'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { toast } from 'sonner'
import { fetchClient } from '@/utils/fetch-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { emitter } from '@/utils/emitter'

interface MessageItemProps {
  id: string
  role: MessageRoleType
  content: string
  reasoning?: string
  isDone?: boolean
}

// 渲染每一条message
export const MessageItem = (props: MessageItemProps) => {
  const { id, role, content, reasoning, isDone = false } = props
  const isUser = role === 'user'
  const isAI = role === 'assistant'
  const [copy] = useCopyToClipboard()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const actions = [
    {
      icon: Copy,
      label: '复制',
      className: 'w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px]',
      onClick: () => {
        copy(content).then(() => {
          toast.success('复制成功')
        })
      }
    },
    {
      icon: Trash2,
      label: '删除',
      className: 'w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px] text-red-500',
      onClick: () => {
        setShowDeleteConfirm(true)
      },
    }
  ]

  // 删除会话
  const deleteConversation = async (id: string) => {
    let res = await fetchClient(`/api/conversation/${id}`, {
      method: 'DELETE',
    })
    if (res.code === 200) {
      emitter.emit('delete-conversation', id)
      toast.success('删除成功')
    }
  }

  // 确认删除
  const confirmDelete = () => {
    deleteConversation(id)
    setShowDeleteConfirm(false)
  }

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <div className='w-full group'>
      <div className='flex flex-col item-end gap-2 w-full mt-3'>
        {isUser ? (
          <UserMessage content={content} />
        ) : (
          <AIMessage
            content={content}
            reasoning={reasoning}
            isDone={isDone}
          />
        )}
        <div
          className={`flex flex-col justify-start w-full h-[40px] select-none pt-2`}
        >
          <div
            className={`flex flex-row ${
              isAI ? 'justify-start' : 'justify-end'
            } w-full gap-[10px] text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]`}
          >
            {isDone && (
              <TooltipProvider>
                {actions.map((action) => (
                  <Tooltip key={action.label}>
                    <TooltipTrigger
                      asChild
                      onClick={action.onClick}
                    >
                      <button className={action.className}>
                        <action.icon size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{action.label}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      
      {/* 删除确认弹窗 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className='sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这条消息吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={cancelDelete}
              className='border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]'
            >
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              className='bg-red-500 hover:bg-red-600 text-white focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 用户发出的消息
const UserMessage = ({ content }: { content: string }) => {
  return (
    <div className='bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex-wrap max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] px-4 py-3 min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all ml-auto'>
      {content}
    </div>
  )
}

// AI回复的消息
const AIMessage = ({
  content,
  reasoning,
  isDone = false
}: {
  content: string
  reasoning?: string
  isDone?: boolean
}) => {
  // TODO 完成loading逻辑
  return (
    <>
      {content || reasoning ? (
        <>
          {/* 显示思考过程 */}
          {reasoning && (
            <Reasoning
              isStreaming={false}
              defaultOpen={true}
            >
              <ReasoningTrigger title='Thinking' />
              <ReasoningContent>{reasoning}</ReasoningContent>
            </Reasoning>
          )}
          <div className='flex-wrap max-w-[90%]'>
            {/* 渲染 Markdown */}
            {content && <MarkdownRender>{content}</MarkdownRender>}
          </div>
        </>
      ) : (
        <div className='flex-wrap max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all mr-auto'>
          <ShinyText
            text='正在思考中'
            disabled={false}
            speed={3}
            className='text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] mr-1'
          />
          <DotLoading />
        </div>
      )}
    </>
  )
}
