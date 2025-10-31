import { create } from 'zustand'

export interface HistoryItem {
  id: string
  subject: string
  create_time: string
}

interface HistoryStore {
  histories: HistoryItem[]
  setHistories: (histories: HistoryItem[]) => void
  addHistory: (id: string, history: HistoryItem) => void
  removeHistory: (id: string) => void
  clearHistories: () => void
}

export const useHistoryStore = create<HistoryStore>()((set, get) => ({
  histories: [],

  setHistories: (histories) => set({ histories }),

  addHistory: (historyId, history) => {
    const currentHistories = get().histories
    // 检查是否已存在相同的ID，如果存在则更新，否则添加
    const existingIndex = currentHistories.findIndex(
      (item) => item.id === historyId
    )
    if (existingIndex >= 0) {
      const updatedHistories = [...currentHistories]
      updatedHistories[existingIndex] = history
      set({ histories: updatedHistories })
    } else {
      set({ histories: [history, ...currentHistories] })
    }
  },
  removeHistory: (id) => {
    const currentHistories = get().histories
    const filteredHistories = currentHistories.filter((item) => item.id !== id)
    set({ histories: filteredHistories })
  },

  clearHistories: () => set({ histories: [] })
}))

// 导出便捷的访问函数
export const getHistories = () => useHistoryStore.getState().histories
export const setHistories = (histories: HistoryItem[]) =>
  useHistoryStore.getState().setHistories(histories)
export const addHistory = (id: string, history: HistoryItem) =>
  useHistoryStore.getState().addHistory(id, history)
export const removeHistory = (id: string) =>
  useHistoryStore.getState().removeHistory(id)
export const clearHistories = () => useHistoryStore.getState().clearHistories
