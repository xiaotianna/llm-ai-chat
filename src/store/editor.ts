import { ModelName, models } from '@/config/model'
import { create } from 'zustand'

interface EditorStore {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  cacheMessage: string
  setCacheMessage: (message: string) => void
  model: ModelName
  setModel: (model: ModelName) => void
  init: () => void
}

// chat editor相关状态管理
export const useEditorStore = create<EditorStore>()((set) => ({
  // 发送按钮是否可用
  isLoading: false,
  setLoading: (loading) => set(() => ({ isLoading: loading })),
  // 临时消息（/chat 跳转到 /chat/local_xxx 时使用）
  cacheMessage: '',
  setCacheMessage: (message: string) => set(() => ({ cacheMessage: message })),
  // 当前选中的模型
  model: models[0].name,
  setModel: (model: ModelName) => set(() => ({ model })),
  // 初始化状态
  init: () => {
    set(() => ({ isLoading: false, cacheMessage: '' }))
  }
}))
