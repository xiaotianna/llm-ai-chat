import { create } from 'zustand'

interface ChatStore {
  isLoading: boolean
  localMessageId: string | null
  setLoading: (loading: boolean) => void
  setLocalMessageId: (id: string | null) => void
}

// 存储会话状态
export const useChatStore = create<ChatStore>()((set) => ({
  isLoading: false,
  localMessageId: null,
  setLoading: (loading) => set(() => ({ isLoading: loading })),
  setLocalMessageId: (id) => set(() => ({ localMessageId: id }))
}))
