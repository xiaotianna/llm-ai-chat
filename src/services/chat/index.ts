import { ModelType } from '@/types/model/model-config'
import { openai } from '@/utils/open-ai'

export const generateSubjectService = async (message: string, model: ModelType) => {
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
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'subject',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              subject: {
                type: 'string',
                description: 'The subject of the message'
              }
            }
          }
        }
      }
    }
  )
  return subject
}
