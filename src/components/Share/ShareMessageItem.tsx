import { ToolMessage } from '@/components/Message/ToolMessage'
import { UserMessage } from '../Message/UserMessage'
import { AIMessage } from '../Message/AIMessage'
import { MessageRoleType } from '@/types'

interface MessageItemProps {
  id: string
  role: MessageRoleType
  content: string
  reasoning?: string
  tool_name?: string
}

export const ShareMessageItem = (props: MessageItemProps) => {
  const { id, role, content, reasoning, tool_name } = props
  const isUser = role === 'user'
  const isAI = role === 'assistant'
  const isTool = role === 'tool'

  return (
    <div className='w-full group'>
      <div className='flex flex-col item-end gap-2 w-full mt-3'>
        {isUser && <UserMessage content={content} />}
        {isAI && (
          <AIMessage
            content={content}
            reasoning={reasoning}
            isDone={true}
          />
        )}
        {isTool && (
          <ToolMessage
            id={id}
            content={content}
            isDone={true}
            tool_name={tool_name || 'tool_name'}
          />
        )}
      </div>
    </div>
  )
}
