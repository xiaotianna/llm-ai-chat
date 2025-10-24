import { User } from '@/store/user'
import Cookies from 'js-cookie'

// 从 cookies 中获取用户信息的辅助函数
export const getUserInfoFromCookies = (): User | null => {
  if (typeof window === 'undefined') return null

  try {
    const userInfoCookie = Cookies.get('user-info')
    if (userInfoCookie) {
      const userInfo = JSON.parse(decodeURIComponent(userInfoCookie))
      return {
        id: userInfo.id || '',
        name: userInfo.name || userInfo.email?.split('@')[0] || 'GitHub User',
        email: userInfo.email || '',
        avatar: userInfo.avatar || '/logo.png',
        token: userInfo.token || '',
        joinDate:
          userInfo.joinDate ||
          new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
          }),
        type: userInfo.type || 'email'
      }
    }
  } catch (error) {
    console.error('Error parsing user info from cookies:', error)
  }

  return null
}
