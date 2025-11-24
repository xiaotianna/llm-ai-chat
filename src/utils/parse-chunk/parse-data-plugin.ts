import { ParsePlugin } from './plugin'
import { ParseChunkResult } from './index'

export type ParseChunkType = { content: string; type: 'content' | 'reasoning', prev_id?: string | null }

export const parseDataPlugin: ParsePlugin<ParseChunkType[], ParseChunkResult> = {
  name: 'parseData',
  prefix: 'data: ',
  parse: (data: string) => {
    const result: ParseChunkType[] = []
    try {
      const parsed: {
        reasoning?: string
        content?: string
        prev_id?: string | null
      } = JSON.parse(data)
      // 思考内容
      if (parsed.reasoning) {
        result.push({
          type: 'reasoning',
          content: parsed.reasoning,
          prev_id: parsed.prev_id
        })
      }
      // 内容
      if (parsed.content) {
        result.push({
          type: 'content',
          content: parsed.content,
          prev_id: parsed.prev_id
        })
      }
      return result
    } catch (error) {
      console.error('Error parsing SSE data:', data)
      throw new Error('Error parsing SSE data: ' + (error as Error).message)
    }
  },
  process: (result: ParseChunkType[], collector: ParseChunkResult) => {
    collector.data.push(...result)
  }
}