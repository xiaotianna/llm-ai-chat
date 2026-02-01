import React, { useState } from 'react'
import { MessageRoleType } from '@/types'
import { Copy, Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip'
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
import { ToolMessage } from './ToolMessage'
import { UserMessage } from './UserMessage'
import { AIMessage } from './AIMessage'

interface MessageItemProps {
  id: string
  role: MessageRoleType
  content: string
  reasoning?: string
  isDone?: boolean
  error?: string
  next_id: string | null
  tool_name?: string
}

// 渲染每一条message
export const MessageItem = React.memo((props: MessageItemProps) => {
  const {
    id,
    role,
    content,
    reasoning,
    isDone = false,
    error,
    next_id,
    tool_name
  } = props
  const isUser = role === 'user'
  const isAI = role === 'assistant'
  const isTool = role === 'tool'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const actions = [
    {
      icon: Copy,
      label: '复制',
      className:
        'w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px]',
      onClick: () => {
        emitter.emit('copy', id)
      }
    },
    {
      icon: Trash2,
      label: '删除',
      className:
        'w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px] text-red-500',
      onClick: () => {
        setShowDeleteConfirm(true)
      }
    }
  ]

  // 确认删除
  const confirmDelete = () => {
    emitter.emit('delete-message', id)
    setShowDeleteConfirm(false)
  }

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <div className='w-full group'>
      <div className='flex flex-col item-end gap-2 w-full mt-3'>
        {isUser && <UserMessage content={content} />}
        {isAI && (
          <AIMessage
            content={content}
            reasoning={reasoning}
            isDone={isDone}
            error={error}
          />
        )}
        {isTool && (
          <ToolMessage
            id={id}
            content={content}
            isDone={isDone}
            tool_name={tool_name || 'tool_name'}
          />
        )}
        {!next_id && (
          <div
            className={`flex flex-col justify-start w-full h-[40px] select-none pt-2`}
          >
            <div
              className={`flex flex-row ${
                isAI ? 'justify-start' : 'justify-end'
              } w-full gap-[10px] text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]`}
            >
              {isDone && !error && (
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
        )}
      </div>

      {/* 删除确认弹窗 */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
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
})
