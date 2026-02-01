// 用户发出的消息
export const UserMessage = ({ content }: { content: string }) => {
  return (
    <div className='bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex-wrap max-w-[90%] flex items-center text-[rgba(var(--coze-fg-3),var(--coze-fg-4-alpha))] px-4 py-3 min-w-2 rounded-[16px] text-left whitespace-pre-wrap break-all ml-auto'>
      {content}
    </div>
  )
}
