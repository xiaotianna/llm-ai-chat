import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/store/user'
import { Calendar, Mail, User, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfileModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const UserProfileModal = ({ open, onOpenChange }: UserProfileModalProps) => {
  const { user } = useUserStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
  }

  const currentOpen = open !== undefined ? open : isOpen

  if (!user) {
    return null
  }

  // 复制文本到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`已复制${label}到剪贴板`)
    })
  }

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold">个人中心</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          {/* 用户头像和基本信息 */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} className="rounded-lg" />
              <AvatarFallback className="text-lg rounded-lg bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))] text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]">{user.name}</h3>
            </div>
          </div>

          {/* 用户详细信息 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] p-3">
              <User className="h-5 w-5 text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))] uppercase tracking-wider">用户ID</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] truncate">{user.id}</p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]"
                    onClick={() => copyToClipboard(user.id, "用户ID")}
                  >
                    <Copy className="h-3 w-3 text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-lg border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] p-3">
              <Mail className="h-5 w-5 text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))] uppercase tracking-wider">邮箱</p>
                <p className="text-sm text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] truncate">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 rounded-lg border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] p-3">
              <Calendar className="h-5 w-5 text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))] uppercase tracking-wider">注册时间</p>
                <p className="text-sm text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]">{user.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserProfileModal