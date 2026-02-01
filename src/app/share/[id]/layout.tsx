import React from 'react'
import type { Metadata } from 'next'
import { getShareHistoryAction } from './action'
/**
 * 分享页面 SSR 渲染
 * 服务端渲染，提升 SEO 和首屏加载性能
 */

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { data } = await getShareHistoryAction(id)

  if (!data) {
    return {
      title: '分享不存在 - AI Chat',
      description: '该分享链接已失效或不存在'
    }
  }

  const { history } = data
  const description = `查看用户分享的对话：${history.subject}`
  const title = `${history.subject} - AI Chat 分享`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: history.create_time,
      authors: ['用户'],
      siteName: 'AI Chat',
      locale: 'zh_CN'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    }
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
