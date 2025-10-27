import { MessagesType, ModelConfigKey } from '@/types/model/model-config'
import { parseChunk, ParseChunkType } from '@/utils/parse-chunk'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

export const useSSE = (url: string, modelName: ModelConfigKey, conversationId?: string) => {
  const [error, setError] = useState<{
    message: string
    code: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDone, setIsDone] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      // 清除实例
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // 调用play触发sse请求
  const play = async (
    message: string, // 只传入当前的内容，会去后端数据库查询上下文消息，如果内容有引用上文消息，传入到数组中
    onData: (chunk: ParseChunkType[]) => void
  ) => {
    // 初始化状态
    setError(null)
    setIsLoading(true)
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
          conversationId
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
        onData(parsedChunk)
      }
    } catch (error: any) {
      // 忽略取消请求的错误
      if (error.name !== 'AbortError') {
        toast.error(error.message || 'An error occurred')
        setError(error.message || 'An error occurred')
      }
    } finally {
      abortControllerRef.current = null
      setIsLoading(false)
      setIsDone(true)
    }
  }

  // 中止请求
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    setIsLoading(false)
    setIsDone(true)
  }

  return { error, isLoading, isDone, play, stop }
}
