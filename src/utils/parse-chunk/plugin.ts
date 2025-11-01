// 定义插件接口
export interface ParsePlugin<T = any, R = any> {
  // 插件能处理的前缀，如 'data: '、'done: '、'init: '
  prefix: string
  // 插件名称，用于调试和日志
  name: string
  // 解析函数，返回处理结果或undefined（表示未处理）
  parse: (data: string) => T
  // 处理函数，定义如何将解析结果添加到最终结果中
  process: (result: T, collector: R) => void
}

export class ParsePluginManager<T, R> {
  private plugins: Map<string, ParsePlugin<T, R>> = new Map()

  // 注册插件
  use(plugin: ParsePlugin<T, R>): void {
    this.plugins.set(plugin.prefix, plugin)
  }

  // 获取插件
  getPlugin(prefix: string): ParsePlugin<T, R> | undefined {
    return this.plugins.get(prefix)
  }

  // 获取所有插件
  getAllPlugins(): ParsePlugin<T, R>[] {
    return Array.from(this.plugins.values())
  }
}
