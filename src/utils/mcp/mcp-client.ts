import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'

interface ServerConfig {
  id: string
  name: string
  url: string
  type: 'sse' | 'streamable_http'
}

// 定义连接服务器返回的类型
interface ConnectedServer extends ServerConfig {
  client: Client<any, any, any>
  transport: StreamableHTTPClientTransport | SSEClientTransport
}

class MCPConnect {
  servers: Record<string, ConnectedServer>
  private initPromise: Promise<void>

  constructor(serversConfig: ServerConfig[]) {
    this.servers = {}
    this.initPromise = this.connectServers(serversConfig)
  }

  // 等待初始化完成
  async waitForInitialization() {
    await this.initPromise
  }

  // 连接所有服务器
  private async connectServers(serversConfig: ServerConfig[]) {
    try {
      // 使用 Promise.allSettled 来处理部分连接失败的情况
      const results = await Promise.allSettled(
        serversConfig.map((serverConfig) =>
          this.clientConnectServer(serverConfig)
        )
      )
      // 只收集成功的连接
      const successfulConnections: Record<string, ConnectedServer> = {}
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const server = result.value
          successfulConnections[server.id] = server
        } else {
          console.error(
            `连接服务器 ${serversConfig[index].id} 失败:`,
            result.reason
          )
        }
      })
      this.servers = successfulConnections
    } catch (error) {
      console.error('连接服务器时出错:', error)
      throw error
    }
  }

  // mcp client 连接 mcp server（需要一对一的连接）
  private async clientConnectServer(
    serverConfig: ServerConfig
  ): Promise<ConnectedServer> {
    try {
      const client = new Client({
        name: `${serverConfig.name}-${serverConfig.id}`,
        version: '1.0.0'
      })
      client.onerror = (error) => {
        console.error(`[${serverConfig.id}] 客户端错误:`, error)
      }

      let transport: StreamableHTTPClientTransport | SSEClientTransport
      if (serverConfig.type === 'sse') {
        transport = new SSEClientTransport(new URL(serverConfig.url))
      } else {
        transport = new StreamableHTTPClientTransport(new URL(serverConfig.url))
      }

      await client.connect(transport)

      return {
        ...serverConfig,
        client,
        transport
      }
    } catch (error) {
      console.error(`[${serverConfig.id}] 连接失败:`, error)
      throw error
    }
  }

  // 关闭连接
  async closeConnection() {
    await Promise.all(
      Object.values(this.servers).map((server) => server.transport.close())
    )
    this.servers = {}
    console.log('所有服务器连接已关闭')
  }

  // 获取单个 mcp server 的所有工具
  async getServerTools(key: string) {
    try {
      await this.waitForInitialization()
      const server = this.servers[key]
      if (!server) {
        console.log(`Server at key: ${key} not found`)
        return []
      }
      const result = await server.client.listTools()
      return result.tools
    } catch (error) {
      console.error(`获取工具失败:`, error)
      throw error
    }
  }

  // 获取所有 mcp server 的所有工具
  async getAllServerTools() {
    const allTools = []
    await this.waitForInitialization()
    for (const server of Object.values(this.servers)) {
      try {
        const tools = await this.getServerTools(server.id)
        allTools.push(...tools)
      } catch (error) {
        // 失败不放入给ai的工具列表中
        console.error(`获取工具失败:`, error)
      }
    }
    return allTools
  }

  // 执行 mcp server 的某个工具
  async executeServerTool(
    key: string,
    toolName: string,
    args: Record<string, any>
  ) {
    try {
      await this.waitForInitialization()
      const server = this.servers[key]
      if (!server) {
        console.log(`Server at key: ${key} not found`)
        return
      }
      const result = await server.client.callTool({
        name: toolName,
        arguments: args
      })
      return result.toolResult
    } catch (error) {
      console.error(`执行工具失败:`, error)
      throw error
    }
  }
}

export { MCPConnect, type ConnectedServer, type ServerConfig }
