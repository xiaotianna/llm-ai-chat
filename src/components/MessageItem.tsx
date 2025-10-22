import { MessageRoleType } from '@/types'
import MarkdownRender from './MarkdownRender'
import { Copy, RefreshCw, SquarePen, Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'
import { StreamDataType } from '@/hooks/useSSE'
import { useEffect, useState } from 'react'

// 渲染每一条message
export const MessageItem = ({
  role,
  content,
  reasoning,
  isLast
}: {
  role: MessageRoleType
  content: string
  reasoning?: string
  isLast: boolean
}) => {
  const isUser = role === 'user'
  const isAI = role === 'assistant'
  return (
    <div className='w-full group'>
      <div className='flex flex-col item-end gap-2 w-full mt-3'>
        {isUser ? (
          <UserMessage content={content} />
        ) : (
          <AIMessage content={content} reasoning={reasoning} />
        )}
        <div
          className={`flex flex-col justify-start w-full h-[40px] select-none ${
            !isLast && 'opacity-0'
          } group-hover:opacity-100 transition-opacity duration-200`}
        >
          <div
            className={`flex flex-row ${
              isUser ? 'justify-end' : 'justify-start'
            } w-full gap-[10px] text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]`}
          >
            <TooltipProvider>
              {/* 修改按钮 -> 只有user才能修改 */}
              {isUser && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className='w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px]'>
                      <SquarePen size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>修改</TooltipContent>
                </Tooltip>
              )}
              {/* 复制按钮 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className='w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px]'>
                    <Copy size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>复制</TooltipContent>
              </Tooltip>
              {/* 重新生成 -> 只有ai回复的消息并且是最后条消息才展示 */}
              {isAI && isLast && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className='w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px]'>
                      <RefreshCw size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>重新生成</TooltipContent>
                </Tooltip>
              )}
              {/* 删除按钮 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className='w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px] text-red-500'>
                    <Trash2 size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>删除</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
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
  reasoning
}: {
  content: string
  reasoning?: string
}) => {
  return (
    <>
      {content || reasoning ? (
        <div className='flex-wrap max-w-[90%] flex items-center py-3 min-w-2 rounded-[16px] whitespace-pre-wrap break-all mr-auto'>
          {/* 显示思考过程 */}
          {reasoning && (
            <div className='mb-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-200'>
              <span className='font-bold'>思考中:</span> {reasoning}
            </div>
          )}
          {/* 渲染 Markdown */}
          {content && <MarkdownRender content={content} />}
        </div>
      ) : (
        <div className='bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex-wrap max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] px-4 py-3 min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all mr-auto'>
          <span className='text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))]'>
            正在思考...
          </span>
        </div>
      )}
    </>
  )
}
