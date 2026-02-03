// 在 requestAnimationFrame 中收集流式响应chunk，一次性处理渲染
export class StreamBuffer {
  private buffer: string = ''
  private rafId: number | null = null

  constructor(private onRefresh: (buffer: string) => void) {}

  // 添加chunk
  append(chunk: string) {
    this.buffer += chunk
    this.scheduleRefresh()
  }

  // 下一帧刷新，通知父组件处理
  private scheduleRefresh() {
    if (this.rafId !== null) return
    this.rafId = requestAnimationFrame(() => {
      this.refresh()
      this.rafId = null
    })
  }

  private refresh(): void {
    if (this.buffer) {
      this.onRefresh(this.buffer)
      this.buffer = ''
    }
  }

  // 强制刷新，同时防止内存泄漏
  // 因为 requestAnimationFrame 执行时机的问题，会取消未执行的 rAF，最后一段数据不会触发 onDone，消息会一直 loading
  // 所以需要调用 refresh 方法
  forceRefresh() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.refresh()
  }
}
