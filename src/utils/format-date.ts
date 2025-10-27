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
