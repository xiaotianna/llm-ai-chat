import { ParsePlugin } from './plugin'
import { ParseChunkResult } from './index'

export type ParseDoneChunkType = {
  id: string
  history_id: string
  type: 'user' | 'assistant'
  create_time: string
}

export const parseDonePlugin: ParsePlugin<ParseDoneChunkType[], ParseChunkResult> = {
  name: 'parseDone',
  prefix: 'done: ',
  parse: (data: string) => {
    try {
      const parsed: ParseDoneChunkType[] = JSON.parse(data)
      return parsed
    } catch (err: any) {
      console.error('Error parsing SSE done data:', data)
      throw new Error('Error parsing SSE done data: ' + err.message)
    }
  },
  process: (result: ParseDoneChunkType[], collector: ParseChunkResult) => {
    collector.done.push(...result)
  }
}