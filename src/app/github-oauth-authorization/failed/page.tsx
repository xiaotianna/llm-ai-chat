'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, RefreshCw, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthFailure() {
  const router = useRouter()

  const handleRetry = () => {
    router.replace('/login')
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 transition-colors duration-300 bg-slate-100 dark:bg-slate-900'>
      <Card className='w-full max-w-md mx-auto shadow-2xl border-0 transition-colors duration-300 bg-white dark:bg-slate-800'>
        <CardContent className='p-8'>
          {/* Error Icon */}
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 bg-red-50 dark:bg-red-900/30'>
              <X className='w-8 h-8 text-red-500 dark:text-red-400' />
            </div>
          </div>

          {/* Title */}
          <div className='text-center mb-2'>
            <h1 className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>
              登录失败
            </h1>
          </div>

          {/* Subtitle */}
          <div className='text-center mb-8'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              我们无法完成您的身份验证请求。
            </p>
          </div>

          {/* Error Details */}
          <div className='rounded-lg p-4 mb-8 border bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/30'>
            <div className='flex items-start gap-3 mb-3'>
              <AlertTriangle className='w-5 h-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400' />
              <div>
                <h3 className='font-medium text-sm text-red-800 dark:text-red-300 mb-2'>
                  授权失败
                </h3>
                <p className='text-xs text-red-700 dark:text-red-200/80 mb-3'>
                  GitHub OAuth进程被中断或取消。
                </p>
                <p className='text-xs text-red-700 dark:text-red-200/80 mb-2'>
                  这可能是由于：
                </p>
                <ul className='text-xs space-y-1 text-red-600 dark:text-red-200/70'>
                  <li className='flex items-center gap-2'>
                    <div className='w-1 h-1 rounded-full bg-red-500 dark:bg-red-400' />
                    网络连接问题
                  </li>
                  <li className='flex items-center gap-2'>
                    <div className='w-1 h-1 rounded-full bg-red-500 dark:bg-red-400' />
                    GitHub服务暂时不可用
                  </li>
                  <li className='flex items-center gap-2'>
                    <div className='w-1 h-1 rounded-full bg-red-500 dark:bg-red-400' />
                    授权过程中权限被拒绝
                  </li>
                  <li className='flex items-center gap-2'>
                    <div className='w-1 h-1 rounded-full bg-red-500 dark:bg-red-400' />
                    会话超时
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Try Again Button */}
          <Button
            className='w-full h-12 font-medium transition-all duration-300 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 dark:border dark:border-slate-600'
            onClick={handleRetry}
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
