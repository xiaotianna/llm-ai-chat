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

  const { history, creator } = data
  const description = `查看用户分享的对话：${history.subject}`
  const title = `${history.subject} - AI Chat 分享`

  const openGraph: Metadata['openGraph'] = {
    title,
    description,
    type: 'article',
    publishedTime: history.create_time,
    authors: ['用户'],
    siteName: 'AI Chat',
    locale: 'zh_CN',
  }

  // 添加用户头像到 OpenGraph 图片
  if (creator?.avatar) {
    openGraph.images = [
      {
        url: creator.avatar,
        width: 200,
        height: 200,
        alt: creator.name || '用户头像'
      }
    ]
  }

  return {
    title,
    description,
    openGraph,
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
