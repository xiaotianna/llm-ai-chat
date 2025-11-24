import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import z from 'zod'
import { Router, type Router as ExpressRouter } from 'express'

const server = new McpServer({
  name: 'demo-server',
  version: '1.0.0'
})

const mockAlertsData = {
  features: [
    {
      properties: {
        event: '高温预警',
        areaDesc: '江苏省南京市',
        severity: 'Moderate',
        status: 'Actual',
        headline: '江苏省南京市高温预警，持续至晚上8点'
      }
    },
    {
      properties: {
        event: '洪水警报',
        areaDesc: '浙江省沿海地区',
        severity: 'Severe',
        status: 'Actual',
        headline: '因强降雨影响，浙江省沿海地区发布洪水警报'
      }
    }
  ]
}

function formatAlert(feature: any): string {
  const props = feature.properties
  return [
    `Event: ${props.event || 'Unknown'}`,
    `Area: ${props.areaDesc || 'Unknown'}`,
    `Severity: ${props.severity || 'Unknown'}`,
    `Status: ${props.status || 'Unknown'}`,
    `Headline: ${props.headline || 'No headline'}`,
    '---'
  ].join('\n')
}

server.registerTool(
  'get-weather',
  {
    title: 'Get Weather Tool',
    description: '获取某个城市的天气警报',
    inputSchema: {
      state: z.string().length(2).describe('中国某城市的名字（例如 合肥,南京）')
    }
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase()
    // 用于发送http请求，获取
    const alertsData = mockAlertsData

    if (!alertsData) {
      return {
        content: [
          {
            type: 'text',
            text: '无法检索城市警报数据'
          }
        ]
      }
    }

    const features = alertsData.features || []
    if (features.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `没有 ${stateCode} 的活动警报`
          }
        ]
      }
    }

    const formattedAlerts = features.map(formatAlert)
    const alertsText = `活动警报 ${stateCode}：\n\n${formattedAlerts.join(
      '\n'
    )}`

    return {
      content: [
        {
          type: 'text',
          text: alertsText
        }
      ]
    }
  }
)

export const router: ExpressRouter = Router()

router.post('/weather/mock', async (req, res) => {
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
