import { OpenRouterChunkResponse } from '@/types/model/open-router-response'

// 解析open router模型的参数
// 正常的数据格式为：'data: 【数据】'
/**
 * 【数据】格式如下：
 *  {
        id: "xxx", // 本次生成内容的唯一标识符，用于追踪或关联特定的生成请求 / 响应。
        provider: "Chutes", // 模型供应商名称，如 OpenAI、Azure OpenAI、Chutes 等。
        model: "tngtech/deepseek-r1t2-chimera:free", // 模型名称
        object: "chat.completion.chunk", // 响应对象类型，如 chat.completion.chunk、text_completion 等。
        created: 1755245253,
        choices: [ // 模型生成的结果数组（通常包含一个元素，多候选结果时会有多个）
            {
                index: 0, // 结果在数组中的索引
                delta: {
                    role: "assistant",
                    content: "",
                    reasoning: "学习", // 思考内容
                    reasoning_details: [ // 详情信息
                        {
                            type: "reasoning.text",
                            text: "学习",
                            format: "unknown",
                            index: 0
                        }
                    ]
                },
                finish_reason: null, // 生成结束的原因（null 表示未结束）
                native_finish_reason: null, // 服务商原生的结束原因
                logprobs: null
            }
        ]
    }
 */
// 结束的数据格式为：'data: [DONE]'

export type ParseChunkType = { content: string; type: 'content' | 'reasoning' }
export type ParseDoneChunkType = {
  id: string
  history_id: string
  type: 'user' | 'assistant'
  create_time: string
}
export type ParseInitChunkType = {
  historyId: string
  subject: string
} | undefined

export const parseChunk = (
  chunk: string
): {
  data: ParseChunkType[]
  done: ParseDoneChunkType[]
  init: ParseInitChunkType
} => {
  const dataResults: ParseChunkType[] = []
  const doneResults: ParseDoneChunkType[] = []
  let initResults: ParseInitChunkType
  const lines = chunk.split('\n\n').filter((line) => line.trim())
  for (const line of lines) {
    // TODO 改造
    // 解析data: 数据
    const prefix = 'data: '
    if (line.startsWith(prefix)) {
      // 移除 'data: ' 前缀
      const data = line.substring(prefix.length).trim()
      try {
        const parsed: OpenRouterChunkResponse = JSON.parse(data)
        // 思考内容
        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
          const reasoning = parsed.choices[0].delta.reasoning
          if (reasoning) {
            // 返回思考内容，可以用于展示思考过程
            dataResults.push({ type: 'reasoning', content: reasoning })
          }
        }
        // 提取内容
        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
          const content = parsed.choices[0].delta.content
          if (content) {
            dataResults.push({ type: 'content', content })
          }
        }
      } catch (parseError: any) {
        console.error('Error parsing SSE data:', data)
        throw new Error('Error parsing SSE data: ' + parseError.message)
      }
    }
    // 解析done: 数据
    const donePrefix = 'done: '
    if (line.startsWith(donePrefix)) {
      const data = line.substring(donePrefix.length).trim()
      try {
        const parsed: ParseDoneChunkType[] = JSON.parse(data)
        doneResults.push(...parsed)
      } catch (err: any) {
        console.error('Error parsing SSE done data:', data)
        throw new Error('Error parsing SSE done data: ' + err.message)
      }
    }
    // 解析init: 数据
    const initPrefix = 'init: '
    if (line.startsWith(initPrefix)) {
      const data = line.substring(initPrefix.length).trim()
      try {
        const parsed: ParseInitChunkType = JSON.parse(data)
        initResults = parsed
      } catch (err: any) {
        console.error('Error parsing SSE done data:', data)
        throw new Error('Error parsing SSE done data: ' + err.message)
      }
    }
  }
  return {
    data: dataResults,
    done: doneResults,
    init: initResults
  }
}
