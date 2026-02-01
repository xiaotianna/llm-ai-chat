import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDateTime } from '@/utils/format-date'

interface ShareHeaderProps {
  title: string
  emoji?: string
  creator: {
    name: string
    avatar?: string
  }
  updatedAt: string
}

export function ShareHeader({ title, creator, updatedAt }: ShareHeaderProps) {
  return (
    <header className='flex items-start justify-between gap-6 mb-8'>
      <div className='flex-1 min-w-0'>
        <h1 className='text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3'>
          <span className='text-balance'>{title}</span>
        </h1>
        <div className='flex items-center text-sm text-muted-foreground'>
          <span className='text-sm'>创建人：</span>
          <div className='flex items-center gap-2'>
            <Avatar className='h-5 w-5'>
              <AvatarImage
                src={creator.avatar}
                alt={creator.name}
              />
              <AvatarFallback className='text-xs bg-gradient-to-br from-blue-500 to-green-500 text-white'>
                {creator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm'>{creator.name}</span>
          </div>
        </div>
        <div className='text-sm text-muted-foreground mt-2'>
          更新时间：{formatDateTime(updatedAt)}
        </div>
      </div>
      <div className='flex items-start gap-3'>
        <div className='hidden sm:block p-2'>
          <div className='w-26 h-26 md:w-28 md:h-28 rounded-lg flex items-center justify-center p-1'>
            <img
              src={'/jelly.png'}
              alt='Logo'
              className='w-full h-full object-contain'
            />
          </div>
        </div>
      </div>
    </header>
  )
}
