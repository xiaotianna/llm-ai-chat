import { ModelConfig } from '@/config/model'
import { ModelConfigKey, ModelType } from '@/types/model/model-config'
import { Ollama, Message, ChatRequest } from 'ollama'

export class OllamaClient {
  private ollama!: Ollama
  constructor() {
    this.init()
  }

  private init() {
    // 需要执行 ollama serve 启动服务；Docker 内通过 OLLAMA_HOST 指向宿主机（如 host.docker.internal:11434）
    const host = process.env.OLLAMA_HOST ?? 'http://127.0.0.1:11434'
    this.ollama = new Ollama({ host })
  }

  private getModel(modelName: string) {
    const modelKey = modelName as ModelConfigKey
    const model = ModelConfig[modelKey] as ModelType
    return model.model
  }

  async stream(
    modelName: string,
    messages: Message[],
    options?: Omit<ChatRequest, 'messages' | 'model'> & {
      stream?: true
    }
  ) {
    const response = await this.ollama.chat({
      model: this.getModel(modelName),
      messages,
      stream: true,
      ...options,
    })
    return response
  }

  async chat(
    modelName: string,
    messages: Message[],
    options?: Omit<ChatRequest, 'messages' | 'model' | 'stream'> & {
      stream?: false | undefined
    }
  ) {
    const response = await this.ollama.chat({
      model: this.getModel(modelName),
      messages,
      ...options
    })
    return response
  }
}

export const ollama = new OllamaClient()
