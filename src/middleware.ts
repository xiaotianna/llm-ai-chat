import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const userInfoCookie = request.cookies.get('user-info')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  
  // 如果用户已登录且试图访问登录页面，重定向到首页
  if (userInfoCookie && isLoginPage) {
    try {
      const userInfo = JSON.parse(decodeURIComponent(userInfoCookie))
      if (userInfo && userInfo.id) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // 如果cookie解析失败，清除无效的cookie
      const response = NextResponse.next()
      response.cookies.delete('user-info')
      return response
    }
  }

  // 未来可以在这里添加其他路由保护逻辑
  // const token = request.cookies.get('token')?.value
  // if (!token && request.nextUrl.pathname !== '/login') {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  
  return NextResponse.next()
}

export const config = {
  // 匹配需要保护的路径，包括登录页面
  matcher: ['/chat/:path*', '/login'],
}