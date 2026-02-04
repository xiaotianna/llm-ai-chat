import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger
} from '../ui/shadcn-io/ai/reasoning'
import ShinyText from '../ui/shadcn-io/shiny-text'
import DotLoading from '../DotLoading'
import MarkdownRender from '../MarkdownRender'
import type { MessageStatus } from '@/types/model/model-config'

// AI回复的消息
export const AIMessage = ({
  content,
  reasoning,
  status = 'completed',
  error
}: {
  content: string
  reasoning?: string
  status?: MessageStatus
  error?: string
}) => {
  if (error) {
    return (
      <div className='bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex-wrap max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] px-4 py-3 min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all mr-auto'>
        <div className='text-red-500'>出错啦：{error}</div>
      </div>
    )
  }
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
            {/* 加载中：流式中显示动效 */}
            {status === 'streaming' && (
              <div className='flex-wrap mt-2 max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all mr-auto'>
                <DotLoading />
              </div>
            )}
          </div>
        </>
      ) : (
        status === 'streaming' && (
          <div className='flex-wrap max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all mr-auto'>
            <ShinyText
              text='正在思考中'
              disabled={false}
              speed={3}
              className='text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] mr-1'
            />
            <DotLoading />
          </div>
        )
      )}
    </>
  )
}
