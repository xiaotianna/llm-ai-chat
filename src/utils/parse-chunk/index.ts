import { ParsePluginManager } from './plugin'
import { parseDataPlugin, ParseChunkType } from './parse-data-plugin'
import { parseDonePlugin, ParseDoneChunkType } from './parse-done-plugin'
import { parseInitPlugin, ParseInitChunkType } from './parse-init-plugin'

export type { ParseChunkType, ParseDoneChunkType, ParseInitChunkType }

export interface ParseChunkResult {
  data: ParseChunkType[]
  done: ParseDoneChunkType[]
  init: ParseInitChunkType
}

const pluginManager = new ParsePluginManager<any, ParseChunkResult>()
pluginManager.use(parseDataPlugin)
pluginManager.use(parseDonePlugin)
pluginManager.use(parseInitPlugin)

export const parseChunk = (chunk: string): ParseChunkResult => {
  const collector: ParseChunkResult = {
    data: [],
    done: [],
    init: undefined
  }

  const lines = chunk.split('\n\n').filter((line) => line.trim())

  for (const line of lines) {
    for (const plugin of pluginManager.getAllPlugins()) {
      if (line.startsWith(plugin.prefix)) {
        const data = line.substring(plugin.prefix.length).trim()
        try {
          const result = plugin.parse(data)
          plugin.process(result, collector)
        } catch (error) {
          console.error(`Error parsing with plugin ${plugin.name}:`, error)
          throw error
        }
        break
      }
    }
  }

  return collector
}
