'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Zap,
  MessageSquare,
  LogOut,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu'

import Image from 'next/image'
import MobileMenu from './MobileMenu'
import { useUserStore } from '@/store/user'
import { toast } from 'sonner'
import { USER_TYPE_MAP } from '@/constant/common'
import { ThemeToggle } from './ThemeToggle'
import { GitRepoToggle } from './GitRepoToggle'

// 用户下拉菜单组件
function UserDropdown() {
  const { user, clearUser } = useUserStore()

  const handleLogout = async () => {
    try {
      await clearUser()
      toast.success('退出登录成功')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('退出登录失败，请重试')
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-10 w-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
        >
          <img
            src={user.avatar}
            alt={user.name}
            className='h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700'
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/logo.png'
            }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='w-60 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'
      >
        <DropdownMenuLabel className='font-normal p-2'>
          <div className='flex items-center space-x-2'>
            <img
              src={user.avatar}
              alt={user.name}
              className='h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700'
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/logo.png'
              }}
            />
            <div className='flex flex-col space-y-1 flex-1 min-w-0'>
              <p
                className='text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100 break-words'
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-all'
                }}
              >
                {user.name}
              </p>
              <p className='text-xs leading-none text-gray-500 dark:text-gray-400 truncate'>
                {user.email}
              </p>
              <div className='flex items-center mt-1'>
                <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                <p className='text-xs leading-none text-green-600 dark:text-green-400 font-medium'>
                  {USER_TYPE_MAP[user.type]}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group'
          onClick={handleLogout}
        >
          <LogOut className='mr-2 h-4 w-4 text-red-500 group-hover:text-red-600' />
          <span className='text-sm text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300'>
            退出登录
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// 导航项配置
const navMenus = [
  {
    name: '产品',
    active: true,
    children: [
      {
        name: 'AI Chat',
        href: '/chat',
        description: 'AI大模型对话',
        icon: MessageSquare
      }
    ]
  }
]

export type NavMenusType = {
  name: string
  href?: string
  active: boolean
  children?: {
    name: string
    href: string
    description?: string
    icon: any
    badge?: string
  }[]
}[]

export default function Navbar() {
  const { user } = useUserStore()

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-16 items-center justify-between relative'>
        {/* title */}
        <div className='flex items-center gap-2'>
          <Link
            href='/'
            className='flex items-center space-x-2'
            aria-label='Enterprise AI Homepage'
          >
            <div className='text-2xl font-bold flex items-center gap-2'>
              <Image
                src={'/logo.gif'}
                alt='logo'
                width={50}
                height={50}
              />
              <span>AI Chat</span>
            </div>
          </Link>
        </div>
        {/* 右侧按钮容器 */}
        <div className='flex items-center gap-4'>
          <div className='border-3 rounded-[50%] md:block md:border-none'>
            <GitRepoToggle />
          </div>
          <div className='border-3 rounded-[50%] md:block md:border-none'>
            <ThemeToggle />
          </div>
          {/* 桌面端用户信息或登录按钮 */}
          <div className='hidden md:block'>
            {user ? (
              <UserDropdown />
            ) : (
              <Button
                asChild
                className='flex items-center gap-3 px-4 py-2 bg-[#1a1d21] hover:bg-[#2a2d31] text-white rounded-xl border-0 h-[40px] dark:bg-primary dark:hover:bg-primary/90 dark:shadow-[0_0_10px_rgba(36,101,237,0.4)]'
              >
                <Link href='/login'>
                  <Zap className='h-4 w-4 text-white' />
                  <div className='flex flex-col items-start'>
                    <span className='text-sm font-medium'>登录 / 注册</span>
                  </div>
                </Link>
              </Button>
            )}
          </div>
          {/* 移动端菜单 */}
          <MobileMenu navMenus={navMenus} />
        </div>
      </div>
    </header>
  )
}
