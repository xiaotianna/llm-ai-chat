'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

const TypingPromptInput = () => {
  const prompts = [
    '帮我写一封给客户的正式邮件，通知项目延迟交付，并表达歉意。',
    '写一篇关于 Python 异步编程（asyncio）的入门教程，适合中级开发者，包含代码示例和常见问题解答。',
    '撰写一篇关于新安全功能的知识库文章，详细介绍安全功能的用途、配置步骤、使用场景，以及如何解决常见问题。',
    "分析 2025 年人工智能在医疗行业的应用趋势，并预测未来 5 年的发展方向，引用最新研究报告。",
    '为一款智能健身镜撰写广告文案，强调 AI 实时动作纠正功能，目标人群是都市白领。'
  ]

  const [displayText, setDisplayText] = useState('')
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)

  const typingSpeed = 50
  const deletingSpeed = 20
  const pauseBeforeDelete = 2000
  const pauseBeforeNextPrompt = 500

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isTyping) {
      if (currentCharIndex < prompts[currentPromptIndex].length) {
        timeout = setTimeout(() => {
          setDisplayText(
            prompts[currentPromptIndex].substring(0, currentCharIndex + 1)
          )
          setCurrentCharIndex(currentCharIndex + 1)
        }, typingSpeed)
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false)
        }, pauseBeforeDelete)
      }
    } else {
      if (currentCharIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(
            prompts[currentPromptIndex].substring(0, currentCharIndex - 1)
          )
          setCurrentCharIndex(currentCharIndex - 1)
        }, deletingSpeed)
      } else {
        timeout = setTimeout(() => {
          setCurrentPromptIndex((currentPromptIndex + 1) % prompts.length)
          setIsTyping(true)
        }, pauseBeforeNextPrompt)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentCharIndex, currentPromptIndex, isTyping, prompts])

  return (
    <div className='relative w-full max-w-2xl mx-auto'>
      <div className='relative group'>
        <div className='absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000'></div>

        <div className='relative'>
          <Input
            className='pr-20 py-6 text-base rounded-xl backdrop-blur-md border-2 focus-visible:ring-0 focus-visible:ring-offset-0 
            dark:bg-background/20 dark:border-white/5 dark:text-white
            bg-white/80 border-primary/10 text-gray-800 shadow-[0_4px_20px_rgba(36,101,237,0.2)]'
            placeholder=''
            value={displayText}
            readOnly
          />
          <Button
            size='icon'
            className='absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 
            bg-primary/90 hover:bg-primary backdrop-blur-md shadow-md'
            aria-label='Send message'
          >
            <Send className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TypingPromptInput
