import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import './var.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from 'next-themes'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import UserInitializer from '@/components/UserInitializer'
import GlobalLoading from '@/components/GlobalLoading'
import { SidebarProvider } from '@/components/SidebarProvider'
import { ModelProvider } from '@/components/ModelProvider'
import Bannner from '@/components/Bannner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'AI Chat 🌍',
  description: 'AI Chat 大模型应用',
  icons: '/logo.png'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-theme bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))]`}
      >
        <Bannner />
        {/* 
          attribute="class"：将主题作为 HTML 元素的 class 属性添加
          defaultTheme="system"：默认跟随系统设置
          enableSystem：启用系统自动识别
        */}
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
        >
          <ModelProvider>
            <SidebarProvider>
              <UserInitializer />
              <GlobalLoading />
              <AntdRegistry>{children}</AntdRegistry>
              <Toaster richColors />
            </SidebarProvider>
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
