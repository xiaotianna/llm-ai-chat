import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Pin, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { HistoryItem, setHistories, useHistoryStore } from '@/store/history'
import { fetchClient } from '@/utils/fetch-client'
import { useUserStore } from '@/store/user'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DotLoading from '@/components/DotLoading'
import {
  GroupedHistories,
  transformToGroupedHistories
} from '@/utils/transform-to-grouped-histories'
import { cn } from '@/lib/utils'
import { emitter } from '@/utils/emitter'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'

const History = () => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [renameInput, setRenameInput] = useState('')
  const [currentHistoryItem, setCurrentHistoryItem] =
    useState<HistoryItem | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const histories = useHistoryStore(state => state.histories)
  const isMobile = useIsMobile()

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
    const groups = transformToGroupedHistories(histories)
    const sortGroup = groups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sortGroup
  }

  const groupedHistories = useMemo(() => groupAndSortHistories(), [histories])

  const handleRenameClick = (item: HistoryItem) => {
    setCurrentHistoryItem(item)
    setRenameInput(item.subject)
    setShowRenameDialog(true)
    setShowMenu(false)
  }

  const handleDeleteClick = (item: HistoryItem) => {
    setCurrentHistoryItem(item)
    setShowDeleteDialog(true)
    setShowMenu(false)
  }

  const handleRename = async () => {
    if (!currentHistoryItem || !renameInput.trim()) return

    setIsRenaming(true)
    try {
      const res = await fetchClient<HistoryItem>('/api/history', {
        method: 'PATCH',
        body: JSON.stringify({
          subject: renameInput.trim(),
          history_id: currentHistoryItem.id
        })
      })

      if (res.code === 200) {
        // 更新历史记录
        const updatedHistories = histories.map((item) =>
          item.id === currentHistoryItem.id
            ? { ...item, subject: renameInput.trim() }
            : item
        )
        setHistories(updatedHistories)
        setShowRenameDialog(false)
        emitter.emit('update-subject', renameInput.trim())
      }
    } catch (error) {
      console.error('重命名历史记录失败:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    if (!currentHistoryItem) return

    setIsDeleting(true)
    try {
      const res = await fetchClient<boolean>('/api/history', {
        method: 'DELETE',
        body: JSON.stringify({
          history_id: currentHistoryItem.id
        })
      })

      if (res.code === 200) {
        // 从本地状态中移除历史记录
        const updatedHistories = histories.filter(
          (item) => item.id !== currentHistoryItem.id
        )
        setHistories(updatedHistories)
        setShowDeleteDialog(false)
        // 如果当前在被删除的聊天页面，导航回聊天列表页
        if (
          typeof window !== 'undefined' &&
          window.location.pathname.includes(currentHistoryItem.id)
        ) {
          router.push('/chat')
        }
        toast.success('删除成功')
      }
    } catch (error) {
      console.error('删除历史记录失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

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

  const { id } = useParams()
  const [nowId, setNowId] = useState(id)

  useEffect(() => {
    if (id) {
      setNowId(id)
    }
    emitter.on('update-history-id', (id: any) => {
      setNowId(id)
    })
    return () => {
      emitter.off('update-history-id')
    }
  }, [id])

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
          {groupedHistories.map((item) => (
            <div key={item.date + item.label}>
              <div className='text-sm mb-2 pl-3 font-medium text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
                {item.label}
              </div>
              {item.data.map((item) => (
                <div
                  key={item.id}
                  className={cn('rounded-lg p-3 mb-3 cursor-pointer group relative hover:bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))]', 
                    item.id === nowId && 'bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))]'
                  )}
                  onClick={() => {
                    router.push(`/chat/${item.id}`)
                    // 在移动端点击后关闭侧边栏
                    if (isMobile) {
                      const closeEvent = new CustomEvent('close-mobile-sidebar')
                      window.dispatchEvent(closeEvent)
                    }
                  }}
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
                        <div
                          className='rounded px-3 py-2 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center gap-2 cursor-pointer text-[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))]'
                          onClick={() => handleRenameClick(item)}
                        >
                          <Pin className='w-4 h-4' />
                          <span className='text-sm'>重命名</span>
                        </div>
                        <div
                          className='rounded px-3 py-2 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] flex items-center gap-2 cursor-pointer text-red-500'
                          onClick={() => handleDeleteClick(item)}
                        >
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
      {/* 重命名对话框 */}
      <Dialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
      >
        <DialogContent className='sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
          <DialogHeader>
            <DialogTitle className='text-left text-lg font-semibold'>重命名对话</DialogTitle>
            <DialogDescription className='sr-only'>请输入新的对话主题</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Input
                id='subject'
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className='col-span-4 border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] focus-visible:ring-0 focus-visible:ring-offset-0'
                placeholder='请输入新的主题'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowRenameDialog(false)}
              className='border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]'
            >
              取消
            </Button>
            <Button
              type='submit'
              onClick={handleRename}
              disabled={isRenaming}
              className='bg-[rgba(var(--coze-brand-5),1)] hover:bg-[rgba(var(--coze-brand-3),var(--coze-brand-3-alpha))] text-white focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              确认
              {isRenaming && (
                <span className='ml-2 inline'>
                  <DotLoading />
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
      >
        <DialogContent className='sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
          <DialogHeader>
            <DialogTitle className='text-left text-lg font-semibold'>删除对话</DialogTitle>
            <DialogDescription className='sr-only'>
              确定要删除这个对话吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm font-medium mb-4">确定要删除这个对话吗？此操作无法撤销。</div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowDeleteDialog(false)}
              className='border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]'
            >
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-red-500 hover:bg-red-600 text-white focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              {isDeleting ? (
                <>
                  <DotLoading />
                  <span className='ml-2'>删除中...</span>
                </>
              ) : (
                '删除'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default History