import React, { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Bolt, Check, Laugh, LogOut, SunMoon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useUserStore } from '@/store/user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import UserProfileModal from '@/components/UserProfileModal'

const themeConfig = {
  system: '跟随系统',
  light: '亮色',
  dark: '暗色'
}

interface SettingDropdownProps {
  children: React.ReactNode
}

const SettingDropdown = ({ children }: SettingDropdownProps) => {
  const { theme = 'system', setTheme } = useTheme()
  const { clearUser } = useUserStore()
  const router = useRouter()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // 退出登录处理
  const handleLogout = async () => {
    try {
      toast.success('退出登录成功')
      router.replace('/login')
      clearUser()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('退出登录失败，请重试')
    }
  }

  // 处理个人中心点击
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsProfileModalOpen(true)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='mt-auto'>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='flex border w-[220px] rounded-lg flex-col p-1 gap-1'
      >
        <DropdownMenuLabel>设置</DropdownMenuLabel>
        <DropdownMenuItem className='cursor-pointer' onClick={handleProfileClick}>
          <Laugh className='text-[18px] w-[18px] h-[18px]' color={'rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))'} />
          <span>个人中心</span>
        </DropdownMenuItem>
        <UserProfileModal open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className='cursor-pointer'>
            <div className='flex w-full items-center justify-between'>
              <div className='pr-4 flex gap-2 items-center'>
                <SunMoon className='text-[18px] w-[18px] h-[18px]' color={'rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))'} />
                <span>主题</span>
              </div>
              <div className='flex text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))] text-xs items-center'>
                <span>{themeConfig[theme as keyof typeof themeConfig]}</span>
              </div>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {Object.entries(themeConfig).map(([themeType, themeName]) => (
                <DropdownMenuItem
                  key={themeType}
                  onClick={() => setTheme(themeType)}
                >
                  {themeName}
                  {theme === themeType && <Check className='ml-auto' color={'rgba(var(--coze-brand-5),1)'} />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
          <LogOut className='text-[18px] w-[18px] h-[18px]' color={'rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))'} />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SettingDropdown