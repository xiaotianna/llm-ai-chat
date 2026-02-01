import { MessageRoleType } from '@/types'
import { ShareMessageItem } from './ShareMessageItem'
import { ShareConversationType } from '@/app/share/[id]/page'

export const ShareContent = ({
  messages
}: {
  messages: ShareConversationType[]
}) => {
  return (
    <>
      {messages.length > 0 &&
        messages.map((message) => (
          <ShareMessageItem
            key={message.id}
            id={message.id}
            role={message.role as MessageRoleType}
            content={message.content}
            reasoning={message.reasoning}
            tool_name={message.tool_name}
          />
        ))}
    </>
  )
}
