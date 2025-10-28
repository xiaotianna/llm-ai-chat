import { HistoryItem } from '@/store/history'
import { formatDate } from './format-date'

// 按日期分组的类型定义
export type GroupedHistories = {
  label: string
  date: string
  data: HistoryItem[]
}[]

export function transformToGroupedHistories(data: HistoryItem[]) {
  // 如果是单个对象，先转换为数组
  const dataArray = Array.isArray(data) ? data : [data]

  // 按日期分组
  const groupedData: { [date: string]: GroupedHistories[0] } = {}

  dataArray.forEach((item) => {
    // 解析日期
    const dateObj = new Date(item.create_time)
    // 创建日期标签 (例如: "xxxx-xx-xx")
    const dateLabel = dateObj.toISOString().split('T')[0]
    // 创建显示标签 (例如: 今天、昨天)
    const displayLabel = formatDate(dateLabel)

    // 初始化分组
    if (!groupedData[dateLabel]) {
      groupedData[dateLabel] = {
        label: displayLabel,
        date: dateLabel,
        data: []
      }
    }

    // 添加数据项
    groupedData[dateLabel].data.push(item)
  })

  Object.values(groupedData).forEach((group) => {
    group.data.sort((a, b) => {
      return (
        new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
      )
    })
  })

  // 转换为数组形式并按日期排序（最近的在前）
  const result = Object.values(groupedData)
  result.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // 转换为数组形式
  return Object.values(groupedData)
}
