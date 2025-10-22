import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Pin, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'

const History = () => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const { user } = useUserStore()

  // 添加点击事件监听器，用于关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false)
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right - rect.width
    })
    setShowMenu(!showMenu)
  }

  if (!user?.token) {
    return null
  }

  return (
    <>
      <div className='text-sm mb-2 pl-3 font-medium text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
        今天
      </div>
      {/* item */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
        <div
          key={item}
          className='rounded-lg p-3 mb-3 cursor-pointer group relative bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))]'
          onClick={() => router.push(`/chat/${item}`)}
        >
          <div className='text-sm mb-1 truncate font-medium text[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))]'>
            询问对方身份
          </div>
          <div className='text-xs truncate leading-[18px] text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
            已执行完毕，可继续对话
          </div>
          {/* 三个小点按钮 */}
          <div
            className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100'
            onClick={handleMenuClick}
          >
            <div className='p-1 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] rounded-md'>
              <MoreHorizontal className='w-5 h-5' />
            </div>
          </div>
          {/* 弹出菜单 */}
          {showMenu &&
            createPortal(
              <div
                className='fixed bg-white dark:bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] border rounded-lg p-1 min-w-[140px] z-50'
                style={{ top: menuPosition.top, left: menuPosition.left }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className='rounded px-3 py-2 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center gap-2 cursor-pointer text-[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))]'>
                  <Pin className='w-4 h-4' />
                  <span className='text-sm'>重命名</span>
                </div>
                <div className='rounded px-3 py-2 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center gap-2 cursor-pointer text-red-500'>
                  <Trash2 className='w-4 h-4' />
                  <span className='text-sm'>删除</span>
                </div>
              </div>,
              document.body
            )}
        </div>
      ))}
    </>
  )
}

export default History
