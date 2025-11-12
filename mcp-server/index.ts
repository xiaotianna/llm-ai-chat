import {
  McpServer,
  ResourceTemplate
} from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import { z } from 'zod'

// Create an MCP server
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

// Add an addition tool
server.registerTool(
  'get-weather',
  {
    title: 'Get Weather Tool',
    description: '获取某个城市的天气警报',
    inputSchema: {
      state: z.string().length(2).describe('中国某城市的名字（例如 合肥,南京）')
    }
  },
  // async ({ a, b }) => {
  //   const output = { result: a + b }
  //   return {
  //     content: [{ type: 'text', text: JSON.stringify(output) }],
  //     structuredContent: output
  //   }
  // },
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

// Add a dynamic greeting resource
server.registerResource(
  'greeting',
  new ResourceTemplate('greeting://{name}', { list: undefined }),
  {
    title: 'Greeting Resource', // Display name for UI
    description: 'Dynamic greeting generator'
  },
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`
      }
    ]
  })
)

// Set up Express and HTTP transport
const app = express()
app.use(express.json())

app.post('/mcp', async (req, res) => {
  // Create a new transport for each request to prevent request ID collisions
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

const port = parseInt(process.env.PORT || '4000')
app
  .listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`)
  })
  .on('error', (error) => {
    console.error('Server error:', error)
    process.exit(1)
  })
