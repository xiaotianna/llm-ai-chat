import { useModel } from '@/components/ModelProvider'
import { useEditorStore } from '@/store/editor'
import { ModelConfigKey } from '@/types/model/model-config'
import {
  parseChunk,
  ParseChunkType,
  ParseDoneChunkType,
  ParseInitChunkType
} from '@/utils/parse-chunk'
import { ParseToolChunkType } from '@/utils/parse-chunk/parse-tool-plugin'
import { StreamBuffer } from '@/utils/stream-buffer'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

// 状态机：SSE 请求状态
export type SSEState = 'idle' | 'loading' | 'success' | 'error' | 'canceled'

type SSEEvent = 'START' | 'FINISH' | 'ERROR' | 'CANCEL' | 'RESET'

const transition = (state: SSEState, event: SSEEvent): SSEState => {
  switch (state) {
    case 'idle':
      if (event === 'START') return 'loading'
      return state
    case 'loading':
      if (event === 'ERROR') return 'error'
      if (event === 'CANCEL') return 'canceled'
      if (event === 'FINISH') return 'success'
      return state
    case 'success':
    case 'error':
    case 'canceled':
      if (event === 'START') return 'loading'
      if (event === 'RESET') return 'idle'
      return state
    default:
      return state
  }
}

export const useSSE = (
  url: string,
  modelName: ModelConfigKey,
  historyId?: string
) => {
  const [error, setError] = useState<string>('')
  // 用状态机管理 loading / 完成 / 错误等状态
  const [state, setState] = useState<SSEState>('idle')
  const isDone = state !== 'loading'
  const { modelFunctional } = useModel()
  const abortControllerRef = useRef<AbortController | null>(null)
  const init = useEditorStore.getState().init
  let streamBuffer: StreamBuffer | null = null

  useEffect(() => {
    return () => {
      // 清除实例
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      // 确保在组件卸载时设置为完成状态
      setState((prev) => transition(prev, 'FINISH'))
    }
  }, [])

  // 调用play触发sse请求
  const play = async (
    message: string, // 只传入当前的内容，会去后端数据库查询上下文消息，如果内容有引用上文消息，传入到数组中
    onData: (chunk: ParseChunkType[]) => void,
    onDone: (chunk: ParseDoneChunkType[]) => void,
    onInit: (chunk: ParseInitChunkType) => void,
    onTool: (chunk: ParseToolChunkType) => void
  ) => {
    // 初始化状态
    setError('')
    setState((prev) => transition(prev, 'START'))

    // 创建 AbortController 用于取消请求
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // 创建流式响应缓冲区
    streamBuffer = new StreamBuffer((buffer: string) => {
      const parsedChunk = parseChunk(buffer)
      const { data, done: parseDone, init, tool } = parsedChunk
      data.length && onData(data)
      parseDone.length && onDone(parseDone)
      init && onInit(init)
      tool && onTool(tool)
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          model: modelName,
          historyId: historyId?.startsWith('local_') ? undefined : historyId,
          modelFunctional // 将模型功能配置发送到后端
        }),
        signal: abortController.signal
      })
      if (!response.body) {
        throw new Error('响应不支持流式传输')
      }
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || response.statusText)
      }
      // 将二进制流转换为文本流
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      while (true) {
        // 检查是否已中止
        if (abortController.signal.aborted) {
          break
        }

        const { done, value } = await reader.read()
        if (done) {
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        // 处理chunk，将chunk放入流式响应缓冲区
        if (chunk.length) {
          streamBuffer.append(chunk)
        }
      }
    } catch (error: any) {
      // 忽略取消请求的错误
      if (error.name !== 'AbortError') {
        toast.error(error.message || 'An error occurred')
        setError(error.message || 'An error occurred')
        setState((prev) => transition(prev, 'ERROR'))
      }
    } finally {
      streamBuffer?.forceRefresh()
      abortControllerRef.current = null
      // 若已是 error/canceled 则保持不变；loading 正常结束则转为 success
      setState((prev) => transition(prev, 'FINISH'))
      init()
    }
  }

  // 中止请求
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    if (streamBuffer) {
      streamBuffer.forceRefresh()
    }

    setState((prev) => transition(prev, 'CANCEL'))
    init()
  }

  // 向外暴露状态机状态，UI 使用 status 而不是布尔 isDone（isDone目前在外部没有被使用）
  return { error, isDone, status: state, play, stop }
}
