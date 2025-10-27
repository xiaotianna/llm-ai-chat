import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Pin, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getHistories, HistoryItem, setHistories } from '@/store/history'
import { fetchClient } from '@/utils/fetch-client'
import { useUserStore } from '@/store/user'
import { formatDate } from '@/utils/format-date'

// 按日期分组的类型定义
interface GroupedHistories {
  [date: string]: HistoryItem[]
}

const History = () => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const histories = getHistories()

  // 添加点击事件监听器，用于关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false)
      setActiveHistoryId(null)
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right - rect.width
    })
    setShowMenu(!showMenu)
    setActiveHistoryId(id)
  }

  const getHistory = async () => {
    try {
      setLoading(true)
      const res = await fetchClient<HistoryItem[]>('/api/history')
      if (res.code === 200) {
        setHistories(res.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.token) {
      setLoading(false)
      return
    }
    user.token && getHistory()
  }, [user])

  // 按日期分组并排序
  const groupAndSortHistories = (): GroupedHistories => {
    // 按日期分组
    const grouped: GroupedHistories = {}
    histories.forEach((item) => {
      const dateKey = formatDate(item.create_time)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(item)
    })
    return grouped
  }

  const groupedHistories = groupAndSortHistories()

  // 骨架屏组件
  const HistorySkeleton = () => (
    <div className='animate-pulse'>
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className='rounded-lg p-3 mb-3 bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))]'
        >
          <div className='h-4 bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] rounded mb-2'></div>
          <div className='h-3 bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] rounded w-3/4'></div>
        </div>
      ))}
    </div>
  )

  // 无数据展示组件
  const NoDataDisplay = () => (
    <>
      {user?.token ? (
        <div className='text-center py-10 text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
          暂无数据
        </div>
      ) : null}
    </>
  )

  return (
    <>
      {/* loading状态 */}
      {loading ? (
        <HistorySkeleton />
      ) : histories.length === 0 ? (
        <NoDataDisplay />
      ) : (
        <>
          {/* 按日期分组显示历史记录 */}
          {Object.entries(groupedHistories).map(([date, items]) => (
            <div key={date}>
              <div className='text-sm mb-2 pl-3 font-medium text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
                {date}
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className='rounded-lg p-3 mb-3 cursor-pointer group relative bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))]'
                  onClick={() => router.push(`/chat/${item.id}`)}
                >
                  <div className='text-sm mb-1 truncate font-medium text[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))]'>
                    {item.subject}
                  </div>
                  {/* 三个小点按钮 */}
                  <div
                    className='absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100'
                    onClick={(e) => handleMenuClick(e, item.id)}
                  >
                    <div className='p-1 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] rounded-md'>
                      <MoreHorizontal className='w-5 h-5' />
                    </div>
                  </div>
                  {/* 弹出菜单 */}
                  {showMenu &&
                    activeHistoryId === item.id &&
                    createPortal(
                      <div
                        className='fixed bg-white dark:bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] border rounded-lg p-1 min-w-[140px] z-50'
                        style={{
                          top: menuPosition.top,
                          left: menuPosition.left
                        }}
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
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default History
