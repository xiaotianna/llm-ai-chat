import { ModelType } from '@/types/model/model-config'
import { ollama } from '@/utils/ollama'
import { openai } from '@/utils/open-ai'
import { Message } from 'ollama'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const prompts = (message: string) => [
  {
    role: 'system',
    content: '根据用户消息，生成简短的概要标题，内容不超过10个字。'
  },
  {
    role: 'user',
    content: `你的任务是根据用户提供的提示词，生成一个简洁的标题，标题长度不超过10个字。
首先，请仔细阅读用户提供的提示词：
<用户提示词>
{{${message}}}
</用户提示词>
生成标题时，请遵循以下要求：
1. 准确提炼提示词的核心内容或关键信息（核心内容定义为提示词中最能体现主题、意图或核心事件的关键要素）
2. 语言简洁明了，避免冗余
3. 严格控制标题字数，不得超过10个字；禁止使用敏感词汇、禁止出现与提示词主题无关的表述
4. 标题需贴合提示词的主题或意图
`
  }
]

export const generateSubjectService = async (
  message: string,
  model: ModelType
) => {
  const subjectSchema = z.object({
    subject: z.string().describe('The subject of the message')
  })
  const jsonSchema = zodToJsonSchema(subjectSchema)
  const responseFormat = {
    type: 'json_schema' as const,
    json_schema: {
      name: 'subject',
      strict: true,
      schema: jsonSchema
    }
  }

  const subject = await openai.chat(
    prompts(message) as ChatCompletionMessageParam[],
    model.model,
    {
      response_format: responseFormat
    }
  )
  return subject
}

export const ollamaGenerateSubjectService = async (
  message: string,
  model: ModelType
) => {
  const subjectSchema = z.object({
    subject: z.string().describe('The subject of the message')
  })
  const jsonSchema = zodToJsonSchema(subjectSchema)

  const subject = await ollama.chat(model.name, prompts(message) as Message[], {
    format: jsonSchema
  })
  // {"subject": "xxx"}
  return subjectSchema.parse(JSON.parse(subject.message.content))
}
