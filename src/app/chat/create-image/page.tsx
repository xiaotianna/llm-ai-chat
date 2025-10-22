"use client"
import React, { useEffect, useState } from 'react'
import { openai } from '@/utils/open-ai'

const CreateImagePage = () => {
  const [response, setResponse] = useState<string>('')

  useEffect(() => {
    const fetchCompletion = async () => {
      try {
        const completion = await openai.chat([
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'What is the meaning of life?'
          }
        ])

        // 如果返回的是流式响应，需要逐个读取
        let fullResponse = ''
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          fullResponse += content
          setResponse((prev) => prev + content)
        }

        console.log('fullResponse🚀', fullResponse)
      } catch (error) {
        console.error('Error fetching completion:', error)
      }
    }

    fetchCompletion()
  }, [])

  return (
    <div>
      <h1>CreateImagePage</h1>
      <div>{response}</div>
    </div>
  )
}

export default CreateImagePage
