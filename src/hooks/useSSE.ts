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
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

export const useSSE = (
  url: string,
  modelName: ModelConfigKey,
  historyId?: string
) => {
  const [error, setError] = useState<string>('')
  const [isDone, setIsDone] = useState<boolean>(true)
  const { modelFunctional } = useModel()
  const abortControllerRef = useRef<AbortController | null>(null)
  const init = useEditorStore.getState().init

  useEffect(() => {
    return () => {
      // 清除实例
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      // 确保在组件卸载时设置为完成状态
      setIsDone(true)
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
    setIsDone(false)

    // 创建 AbortController 用于取消请求
    const abortController = new AbortController()
    abortControllerRef.current = abortController
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
        const parsedChunk = parseChunk(chunk)
        const { data, done: parseDone, init, tool } = parsedChunk
        data.length && onData(data)
        parseDone.length && onDone(parseDone)
        init && onInit(init)
        tool && onTool(tool)
      }
    } catch (error: any) {
      // 忽略取消请求的错误
      if (error.name !== 'AbortError') {
        toast.error(error.message || 'An error occurred')
        setError(error.message || 'An error occurred')
      }
    } finally {
      abortControllerRef.current = null
      setIsDone(true)
      init()
    }
  }

  // 中止请求
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setIsDone(true)
    init()
  }

  return { error, isDone, play, stop }
}
