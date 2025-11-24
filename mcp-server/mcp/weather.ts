import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Router, type Router as ExpressRouter } from 'express'
import { WeatherService } from '../utils/weather-service.js'
import { LocationService } from '../utils/location-service.js'
import z from 'zod'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
export const router: ExpressRouter = Router()

const server = new McpServer({
  name: 'weather-mcp-server',
  version: '1.0.0'
})

// 初始化服务（无需API密钥）
const weatherService = new WeatherService()
const locationService = new LocationService()

// 工具1: 根据地址获取当前天气
server.registerTool(
  'get-weather-by-address',
  {
    title: '根据地址获取天气',
    description: '根据提供的地址获取当前天气信息',
    inputSchema: {
      address: z
        .string()
        .describe('地址，例如：北京市、上海市浦东新区、New York等')
    }
  },
  async ({ address }) => {
    try {
      const weather = await weatherService.getWeatherByAddress(address)
      const weatherText = weatherService.formatWeatherText(weather)
      const advice = weatherService.getWeatherAdvice(weather)

      return {
        content: [
          {
            type: 'text',
            text: `${weatherText}\n\n💡 建议:\n${advice}`
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `❌ 获取天气信息失败: ${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }
)

// 工具2: 根据地址获取天气预报
server.registerTool(
  'get-forecast-by-address',
  {
    title: '根据地址获取天气预报',
    description: '根据提供的地址获取未来几天的天气预报',
    inputSchema: {
      address: z
        .string()
        .describe('地址，例如：北京市、上海市浦东新区、New York等'),
      days: z
        .number()
        .min(1)
        .max(10)
        .default(5)
        .describe('预报天数，1-10天，默认5天')
    }
  },
  async ({ address, days = 5 }) => {
    try {
      const forecast = await weatherService.getForecastByAddress(address, days)
      const forecastText = weatherService.formatForecastText(forecast)
      const advice = weatherService.getWeatherAdvice(forecast.current)

      return {
        content: [
          {
            type: 'text',
            text: `${forecastText}\n\n💡 当前天气建议:\n${advice}`
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `❌ 获取天气预报失败: ${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }
)

// 工具3: 获取当前位置的天气
server.registerTool(
  'get-current-location-weather',
  {
    title: '获取当前位置天气',
    description: '根据IP地址获取当前位置的天气信息',
    inputSchema: {}
  },
  async () => {
    try {
      const location = await locationService.getCurrentLocation()
      const weather = await weatherService.getCurrentWeather(
        location.latitude,
        location.longitude
      )
      const weatherText = weatherService.formatWeatherText(weather)
      const advice = weatherService.getWeatherAdvice(weather)

      return {
        content: [
          {
            type: 'text',
            text: `🌍 检测到您的位置: ${location.address}\n\n${weatherText}\n\n💡 建议:\n${advice}`
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `❌ 获取当前位置天气失败: ${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }
)

// 工具4: 获取当前位置的天气预报
server.registerTool(
  'get-current-location-forecast',
  {
    title: '获取当前位置天气预报',
    description: '根据IP地址获取当前位置的天气预报',
    inputSchema: {
      days: z
        .number()
        .min(1)
        .max(10)
        .default(5)
        .describe('预报天数，1-10天，默认5天')
    }
  },
  async ({ days = 5 }) => {
    try {
      const location = await locationService.getCurrentLocation()
      const forecast = await weatherService.getWeatherForecast(
        location.latitude,
        location.longitude,
        days
      )
      const forecastText = weatherService.formatForecastText(forecast)
      const advice = weatherService.getWeatherAdvice(forecast.current)

      return {
        content: [
          {
            type: 'text',
            text: `🌍 检测到您的位置: ${location.address}\n\n${forecastText}\n\n💡 当前天气建议:\n${advice}`
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `❌ 获取当前位置天气预报失败: ${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }
)

// 工具5: 根据坐标获取天气
server.registerTool(
  'get-weather-by-coordinates',
  {
    title: '根据坐标获取天气',
    description: '根据经纬度坐标获取天气信息',
    inputSchema: {
      latitude: z.number().min(-90).max(90).describe('纬度，-90到90之间'),
      longitude: z.number().min(-180).max(180).describe('经度，-180到180之间')
    }
  },
  async ({ latitude, longitude }) => {
    try {
      if (!locationService.validateCoordinates(latitude, longitude)) {
        throw new Error('无效的坐标')
      }

      const weather = await weatherService.getCurrentWeather(
        latitude,
        longitude
      )
      const weatherText = weatherService.formatWeatherText(weather)
      const advice = weatherService.getWeatherAdvice(weather)

      return {
        content: [
          {
            type: 'text',
            text: `📍 坐标: ${latitude}, ${longitude}\n\n${weatherText}\n\n💡 建议:\n${advice}`
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `❌ 获取天气信息失败: ${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }
)

// 工具6: 地址解析
server.registerTool(
  'geocode-address',
  {
    title: '地址解析',
    description: '将地址转换为经纬度坐标',
    inputSchema: {
      address: z.string().describe('要解析的地址')
    }
  },
  async ({ address }) => {
    try {
      const result = await locationService.geocodeAddress(address)

      return {
        content: [
          {
            type: 'text',
            text: `📍 地址解析结果:\n\n原地址: ${address}\n标准地址: ${result.address}\n坐标: ${result.latitude}, ${result.longitude}\n城市: ${result.city}\n国家: ${result.country}\n置信度: ${result.confidence}`
          }
        ]
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      return {
        content: [
          {
            type: 'text',
            text: `❌ 地址解析失败: ${errorMessage}`
          }
        ],
        isError: true
      }
    }
  }
)

router.post('/weather', async (req, res) => {
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
