'use server'

import { supabase } from '@/config/supabase'
import { AUTH_ERROR_CODE, AuthErrorCode } from '@/constant/auth-error'
import { redirect } from 'next/navigation'

// github登录
export const login_github = async (origin: string) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/github-oauth-authorization`,
      // 强制使用 PKCE 流程
      // queryParams: {
      //   access_type: 'offline',
      //   prompt: 'consent'
      // }
    }
  })
  if (error) {
    const err_msg = AUTH_ERROR_CODE[error.code as AuthErrorCode] || '登录失败'
    throw new Error(err_msg)
  }
  if (data.url) {
    redirect(data.url)
  }
}
