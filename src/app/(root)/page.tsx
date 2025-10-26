import CssGridBackground from '@/components/CssGridBackground'
import FramerSpotlight from '@/components/FramerSpotlight'
import Navbar from '@/components/Navbar'
import TypingPromptInput from '@/components/TypingPromptInput'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'
import Link from 'next/link'

const HomePage = () => {
  return (
    <div className='flex min-h-screen flex-col'>
      <Navbar />
      <section
        id='hero'
        className='relative min-h-screen flex items-center justify-center overflow-hidden'
      >
        {/* 背景网格 */}
        <CssGridBackground />
        {/* 鼠标滑动阴影动画 */}
        <FramerSpotlight />
        <div className='container px-4 md:px-6 py-16 md:py-20 -mt-24 md:mt-0'>
          <div className='flex flex-col items-center text-center max-w-3xl mx-auto'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6'>
              AI Chat Provides You With The Most Suitable Answer
            </h1>
            <p className='text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mb-12'>
              AI Chat, 一个给你最合适的答案的AI
            </p>
            {/* 自动输入框 */}
            <TypingPromptInput />
            {/* 开始体验按钮 */}
            <div className='flex flex-wrap justify-center gap-3 mt-16'>
              <Link href={'/chat'}>
                <Button className='flex items-center gap-3 px-5 py-6 h-[40px] bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-xl border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] relative overflow-hidden group'>
                  <div className='absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 dark:opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]'></div>
                  <Zap className='h-5 w-5 text-white relative z-10' />
                  <div className='flex flex-col items-start relative z-10'>
                    <span className='text-[15px] font-medium'>开始体验</span>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
