// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // 今天的日期
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  }

  // 昨天的日期
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }

  // 今年的日期显示月日
  if (date.getFullYear() === today.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 往年的日期显示年月日
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/** 格式化日期时间，用于「更新时间」等场景 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const datePart = formatDate(dateString)
  const timePart = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  return `${datePart} ${timePart}`
}
