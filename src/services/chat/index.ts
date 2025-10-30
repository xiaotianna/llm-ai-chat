import { ModelType } from '@/types/model/model-config'
import { openai } from '@/utils/open-ai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

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
    [
      {
        role: 'system',
        content: '根据用户消息，生成简短的概要标题，内容不超过10个字。'
      },
      {
        role: 'user',
        content: `对内容进行总结，总结内容不超过10个字{{：${message}}}`
      }
    ],
    model.model,
    {
      response_format: responseFormat
    }
  )
  return subject
}
