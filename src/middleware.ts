import { NextRequest, NextResponse } from 'next/server'

function isLoginBack(request: NextRequest): boolean {
  if (request.nextUrl.pathname === '/login') {
    return false
  }
  return true
}

// 登录身份校验
function isAuthenticated(request: NextRequest): boolean {
  const userInfo = request.cookies.get('user-info')?.value
  // 有用户信息
  if (userInfo) {
    return true
  }
  return false
}

export async function middleware(request: NextRequest) {
  if (isAuthenticated(request)) {
    if (!isLoginBack(request)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else {
    if (isLoginBack(request)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  // 匹配需要保护的路径
  matcher: ['/chat/:id', '/login']
}
