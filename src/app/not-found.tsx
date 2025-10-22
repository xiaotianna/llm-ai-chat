import CssGridBackground from '@/components/CssGridBackground'
import FramerSpotlight from '@/components/FramerSpotlight'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const NotFound = () => {
  return (
    <div className='flex min-h-screen flex-col'>
      <section
        id='hero'
        className='relative min-h-screen flex items-center justify-center overflow-hidden'
      >
        {/* 背景网格 */}
        <CssGridBackground />
        {/* 鼠标滑动阴影动画 */}
        <FramerSpotlight />
        <div className='container px-4 md:px-6 py-16 md:py-20'>
          <div className='flex flex-col items-center text-center max-w-3xl mx-auto'>
            <div className='inline-block rounded-lg px-3 py-1 text-sm mb-6'>
              <Image src={'/logo.gif'} alt='logo' width={100} height={100} />
            </div>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6'>
              404 Not Found
            </h1>
            <p className='text-xl text-muted-foreground md:text-2xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-2xl mb-12'>
              页面不存在
            </p>
            <div className='flex flex-wrap justify-center gap-3 mt-16'>
              <Button className='flex items-center gap-3 px-5 py-6 h-[40px] bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-xl border-0 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(36,101,237,0.5)] relative overflow-hidden group'>
                <Link href='/'>
                  <span className='absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 bg-[#1a1d21] group-hover:translate-x-full'></span>
                  <span className='relative inline-block transition-all duration-300 ease-out'>
                    返回首页
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NotFound
