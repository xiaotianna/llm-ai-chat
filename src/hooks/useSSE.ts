import { ModelConfig } from '@/config/model'
import { MessagesType, ModelConfigKey } from '@/types/model/model-config'
import { parseChunk } from '@/utils/parse-chunk'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

export type StreamDataType = {
  content: string | null
  type: 'content' | 'reasoning'
}

export const useSSE = (url: string, modelName: ModelConfigKey) => {
  const [data, setData] = useState<StreamDataType | null>(null)
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

  const connect = async (
    messages: MessagesType[] // 只传入当前的内容，会去后端数据库查询上下文消息，如果内容有引用上文消息，传入到数组中
  ) => {
    // 初始化状态
    setData(null)
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
          messages,
          model: modelName
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
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          console.log(chunk, 'chunk');
          
          const parsedChunk = parseChunk(chunk)
          setData(parsedChunk)
        }
      } catch (error) {
        console.error('Error reading stream:', error)
      } finally {
        reader.releaseLock()
      }
    } catch (error: any) {
      // 忽略取消请求的错误
      if (error.name !== 'AbortError') {
        toast.error(error.message || 'An error occurred')
        setError(error.message || 'An error occurred')
      }
    } finally {
      setIsLoading(false)
      setIsDone(true)
    }
  }

  // 调用play触发sse请求
  const play = (messages: MessagesType[]) => {
    connect(messages)
  }

  // 中止请求
  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  return { data, error, isLoading, isDone, play, stop }
}
