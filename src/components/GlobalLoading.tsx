"use client"

import { useUserStore } from '@/store/user'
import Loading from './Loading'

export default function GlobalLoading() {
  const { isLoading, isInitialized } = useUserStore()

  // 如果已经初始化完成且不在加载中，不显示loading
  if (isInitialized && !isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900">
      <Loading />
    </div>
  )
}