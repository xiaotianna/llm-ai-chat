import { NextRequest, NextResponse } from 'next/server'

// 登录页返回首页
function isBackLogin(request: NextRequest): boolean {
  const isLoginPage = request.nextUrl.pathname === '/login'
  if (isLoginPage) {
    return false
  }
  return true
}

// 登录校验
function isAuthenticated(request: NextRequest): boolean {
  const userInfoCookie = request.cookies.get('user-info')?.value
  console.log(userInfoCookie);
  
  if (userInfoCookie) {
    try {
      const userInfo = JSON.parse(decodeURIComponent(userInfoCookie))
      if (userInfo && userInfo.id) {
        return true
      }
    } catch (error) {
      // 如果cookie解析失败，清除无效的cookie
      const response = NextResponse.next()
      response.cookies.delete('user-info')
      return false
    }
  }
  return false
}

export function middleware(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isBackLogin(request)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  // 匹配需要保护的路径，包括登录页面和具体的聊天页面
  matcher: ['/chat/:id']
}
