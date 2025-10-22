import { ModelType } from '@/types/model/model-config'
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
export const parseChunk = (
  chunk: string,
  model: ModelType
): { content: string | null; type: 'content' | 'reasoning' } => {
  const lines = chunk.split('\n').filter((line) => line.trim())
  for (const line of lines) {
    const prefix = model.prefix
    if (line.startsWith(prefix)) {
      // 移除 'data: ' 前缀
      const data = line.substring(prefix.length).trim()
      if (data === model.doneFlage) {
        // 流结束信号
        /**
         * 这是大模型给的最后一条数据，由于考虑到不同大模型返回的结果不同
         * 统一由 ReadableStream 来处理，const { done, value } = await reader.read()，
         * 也就是这里的 done
         */
        // 在useSSE中做了done的处理
        break
      }
      try {
        const parsed: OpenRouterChunkResponse = JSON.parse(data)
        // 思考内容
        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
          const reasoning = parsed.choices[0].delta.reasoning
          if (reasoning) {
            // 返回思考内容，可以用于展示思考过程
            return { type: 'reasoning', content: reasoning }
          }
        }
        // 提取内容
        if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
          const content = parsed.choices[0].delta.content
          if (content) {
            return { type: 'content', content }
          }
        }
      } catch (parseError) {
        console.error('Error parsing SSE data:', data)
      }
    }
  }
  return { content: null, type: 'content' }
}
