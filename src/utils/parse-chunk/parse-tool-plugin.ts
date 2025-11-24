import { ParseChunkResult } from '.'
import { ParsePlugin } from './plugin'

export type ParseToolChunkType =
  | {
      input: Record<string, any>
      output: { type: string; text: string }[]
      tool_name: string
      prev_id?: string | null
    }
  | undefined

export const parseToolPlugin: ParsePlugin<
  ParseToolChunkType,
  ParseChunkResult
> = {
  name: 'parseTool',
  prefix: 'tool: ',
  parse: (data: string) => {
    try {
      const parsed: ParseToolChunkType = JSON.parse(data)
      return parsed
    } catch (error: any) {
      console.error('Error parsing SSE tool data:', data)
      throw new Error('Error parsing SSE tool data: ' + error.message)
    }
  },
  process: (result: ParseToolChunkType, collector: ParseChunkResult) => {
    collector.tool = result
  }
}
