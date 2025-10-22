import { ModelConfig } from '@/config/model'
import { MessagesType, ModelConfigKey } from '@/types/model/model-config'
import { parseChunk } from '@/utils/parse-model-chunk'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

export const useSSE = (url: string, modelName: ModelConfigKey) => {
  const [data, setData] = useState<string>('')
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
    setData('')
    setError(null)
    setIsLoading(true)
    setIsDone(false)

    // 创建 AbortController 用于取消请求
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const connect_url = url + '?model=' + modelName
    try {
      const response = await fetch(connect_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages
        }),
        signal: abortController.signal
      })
      // 检查响应状态
      if (!response.ok) {
        // 尝试获取错误响应的详细信息
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorText = await response.text()
          if (errorText) {
            errorMessage = `Error ${response.status}: ${errorText}`
          }
        } catch (e) {
          // 如果无法读取错误详情，使用默认消息
        }
        throw new Error(errorMessage)
      }

      // 检查是否有可读流
      if (!response.body) {
        throw new Error('ReadableStream not supported')
      }

      // 读取流数据
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          // 流已完成
          if (done) {
            setIsDone(true)
            break
          }
          // 解码数据并更新状态
          const chunk = decoder.decode(value, { stream: true })
          try {
            // 返回的是json数据
            const { error } = JSON.parse(chunk)
            setError(error)
            toast.error(error.message)
          } catch (error) {
            // 解析数据（不同大模型可能有区别）
            // TODO
            const { type, content } = parseChunk(chunk, ModelConfig[modelName])
            content && setData(content)
          }
        }
      } finally {
        // 确保 reader 被关闭
        reader.releaseLock()
      }
    } catch (error: any) {
      // 忽略取消请求的错误
      if (error.name !== 'AbortError') {
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
