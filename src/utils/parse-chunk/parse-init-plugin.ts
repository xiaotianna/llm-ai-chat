import { ParsePlugin } from './plugin'
import { ParseChunkResult } from './index'

export type ParseInitChunkType =
  | {
      historyId: string
      subject: string
    }
  | undefined

export const parseInitPlugin: ParsePlugin<ParseInitChunkType, ParseChunkResult> = {
  name: 'parseInit',
  prefix: 'init: ',
  parse: (data: string) => {
    try {
      const parsed: ParseInitChunkType = JSON.parse(data)
      return parsed
    } catch (error: any) {
      console.error('Error parsing SSE done data:', data)
      throw new Error('Error parsing SSE done data: ' + error.message)
    }
  },
  process: (result: ParseInitChunkType, collector: ParseChunkResult) => {
    collector.init = result
  }
}