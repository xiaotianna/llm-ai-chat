import { ShareHeader } from '@/components/Share/ShareHeader'
import { Separator } from '@/components/ui/separator'
import { getShareHistoryAction } from './action'
import { notFound } from 'next/navigation'
import { ShareContent } from '@/components/Share/ShareContent'
import { MessagesType } from '@/types/model/model-config'

export type ShareConversationType = Omit<
  Required<MessagesType>,
  'isDone' | 'next_id' | 'error' | 'created_time'
>

export default async function SharePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const conversation = await getShareHistoryAction(id)

  // 如果会话不存在，显示404页面
  if (!conversation.data) {
    notFound()
  }

  const { history, creator, conversations } = conversation.data

  const messages: ShareConversationType[] = conversations.map((c) => ({
    id: c.id,
    role: c.type as ShareConversationType['role'],
    content: c.content ?? '',
    reasoning: c.reasoning ?? '',
    tool_name: c.tool_name ?? ''
  }))

  return (
    <>
      <div className='min-h-screen bg-background overflow-auto px-6'>
        <div className='max-w-4xl mt-10 rounded-2xl mx-auto bg-[rgba(var(--coze-bg-11),var(--coze-bg-11-alpha))] px-4 sm:px-6 lg:px-8 py-8 md:py-10 mb-10'>
          <ShareHeader
            title={history.subject || '新对话'}
            creator={{
              name: creator?.name || '用户',
              avatar: creator?.avatar ?? undefined
            }}
            updatedAt={history.create_time || ''}
          />
          <Separator className='my-8' />
          <ShareContent messages={messages} />
        </div>
      </div>
    </>
  )
}
