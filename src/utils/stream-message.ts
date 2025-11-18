export class StreamMessage {
  private controller: ReadableStreamDefaultController
  constructor(controller: ReadableStreamDefaultController) {
    this.controller = controller
  }

  init(data: any) {
    this.controller.enqueue(`init: ${JSON.stringify(data)}\n\n`)
  }

  data(data: any) {
    this.controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
  }

  done(data: any) {
    this.controller.enqueue(`done: ${JSON.stringify(data)}\n\n`)
  }

  tool(data: any) {
    this.controller.enqueue(`tool: ${JSON.stringify(data)}\n\n`)
  }
}
