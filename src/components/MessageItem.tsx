import { MessageRoleType } from '@/types'
import MarkdownRender from './MarkdownRender'
import { Copy, RefreshCw, SquarePen, Trash2 } from 'lucide-react'
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

// 渲染每一条message
export const MessageItem = ({
  role,
  content,
  reasoning,
  isDone = false
}: {
  role: MessageRoleType
  content: string
  reasoning?: string
  isDone?: boolean
}) => {
  const isUser = role === 'user'
  const isAI = role === 'assistant'
  return (
    <div className='w-full group'>
      <div className='flex flex-col item-end gap-2 w-full mt-3'>
        {isUser ? (
          <UserMessage content={content} />
        ) : (
          <AIMessage
            content={content}
            reasoning={reasoning}
          />
        )}
        <div
          className={`flex flex-col justify-start w-full h-[40px] select-none pt-2`}
        >
          <div
            className={`flex flex-row justify-start w-full gap-[10px] text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]`}
          >
            {(isAI && isDone) && (
              <TooltipProvider>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className='w-[24px] h-[24px] cursor-pointer hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center justify-center rounded-[4px]'>
                      <RefreshCw size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>重新生成</TooltipContent>
                </Tooltip>
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
            )}
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
