import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import z from 'zod'
import { getChineseCalendar } from '../lib/chineseCalendar.js'
import { getBaziDetail, getSolarTimes } from '../utils/bazi.js'
import { Router, type Router as ExpressRouter } from 'express'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
export const router: ExpressRouter = Router()

const server = new McpServer({
  name: 'Bazi',
  version: '1.0.0'
})

server.tool(
  'getBaziDetail',
  '根据时间（公历或农历）、性别来获取八字信息。solarDatetime和lunarDatetime必须传且只传其中一个。',
  {
    solarDatetime: z
      .string()
      .optional()
      .describe(
        '用ISO时间格式表示的公历时间. 例如：`2008-03-01T13:00:00+08:00`。'
      ),
    lunarDatetime: z
      .string()
      .optional()
      .describe(
        '农历时间。例如农历2000年5月初五中午12点整表示为：`2000-5-5 12:00:00`。'
      ),

    gender: z.number().describe('传0表示女性，传1表示男性。'),
    eightCharProviderSect: z
      .number()
      .default(2)
      .describe(
        '早晚子时配置。传1表示23:00-23:59日干支为明天，传2表示23:00-23:59日干支为当天。'
      )
  },
  async (data) => {
    const result = await getBaziDetail(data as any)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result)
        }
      ]
    }
  }
)

server.tool(
  'getSolarTimes',
  '根据八字获取公历时间列表。返回的时间格式为：YYYY-MM-DD hh:mm:ss。例如时间1998年7月31日下午2点整表示为：1998-07-31 14:00:00',
  {
    bazi: z
      .string()
      .describe(
        '八字，按年柱、月柱、日柱、时柱顺序，用空格隔开。例如：戊寅 己未 己卯 辛未'
      )
  },
  async (data) => {
    const result = await getSolarTimes(data as any)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result)
        }
      ]
    }
  }
)

server.tool(
  'getChineseCalendar',
  '获取指定公历时间（默认今天）的黄历信息。',
  {
    solarDatetime: z
      .string()
      .optional()
      .describe(
        '用ISO时间格式表示的公历时间. 例如：`2008-03-01T13:00:00+08:00`。'
      )
  },
  async ({ solarDatetime }) => {
    const result = getChineseCalendar(solarDatetime)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result)
        }
      ]
    }
  }
)

router.post('/bazi', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  })
  res.on('close', () => {
    transport.close()
  })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})
