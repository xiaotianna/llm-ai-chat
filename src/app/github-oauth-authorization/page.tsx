"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/config/supabase'
import { Card, CardContent } from '@/components/ui/card'

export default function GitHubOAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 检查 URL fragment 中是否有 access_token
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')

        // 如果有错误，显示错误页面
        if (error) {
          console.error('OAuth error:', error, errorDescription)
          setErrorMessage(errorDescription || error)
          setStatus('error')
          setTimeout(() => {
            router.replace('/github-oauth-authorization/failed')
          }, 2000)
          return
        }

        // 如果有 access_token，说明是隐式流程成功
        if (accessToken) {
          // 设置会话
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setStatus('error')
            setTimeout(() => {
              router.replace('/github-oauth-authorization/failed')
            }, 2000)
            return
          }

          if (data.session) {
            setStatus('success')
            // 延迟跳转到成功页面
            setTimeout(() => {
              router.replace('/github-oauth-authorization/success')
            }, 1000)
            return
          }
        }

        // // 检查是否有授权码（PKCE 流程）
        // const urlParams = new URLSearchParams(window.location.search)
        // const code = urlParams.get('code')
        
        // if (code) {
        //   // 使用授权码交换会话
        //   const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
        //   if (exchangeError) {
        //     console.error('Error exchanging code:', exchangeError)
        //     setStatus('error')
        //     setTimeout(() => {
        //       router.replace('/github-oauth-authorization/failed')
        //     }, 2000)
        //     return
        //   }

        //   if (data.session) {
        //     setStatus('success')
        //     setTimeout(() => {
        //       router.replace('/github-oauth-authorization/success')
        //     }, 1000)
        //     return
        //   }
        // }

        // // 如果没有找到任何认证信息
        // console.error('No authentication data found')
        // setStatus('error')
        // setTimeout(() => {
        //   router.replace('/github-oauth-authorization/failed')
        // }, 2000)

      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setTimeout(() => {
          router.replace('/github-oauth-authorization/failed')
        }, 2000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">正在处理 GitHub 登录...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-4 text-green-600">登录成功！正在跳转...</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="mt-4 text-red-600">登录失败</p>
                {errorMessage && (
                  <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">正在跳转到错误页面...</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}