"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle, User, Mail, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useUserStore, setUserInfo } from "@/store/user"

export default function AuthSuccess() {
  const router = useRouter()
  const { user, isLoading, initializeUser } = useUserStore()
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    const handleUserInitialization = async () => {
      try {
        await initializeUser()
        // 如果store中没有用户信息，尝试从cookies获取并设置
        if (!user) {
          const { getUserFromCookies } = useUserStore.getState()
          const cookieUser = getUserFromCookies()
          
          if (cookieUser) {
            setUserInfo(cookieUser)
          } else {
            toast.error('获取用户信息失败')
            router.replace('/login')
            return
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error)
        toast.error('获取用户信息时发生错误')
        router.replace('/login')
      } finally {
        setLocalLoading(false)
      }
    }

    handleUserInitialization()
  }, [router, user])

  if (isLoading || localLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">正在获取用户信息...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-300">登录成功!</h1>
            <p className="text-muted-foreground">欢迎回来!您已成功通过身份验证。</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt="User avatar"
                    className="w-12 h-12 rounded-full border-2 border-background"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=48&width=48"
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium truncate">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">加入于 {user.joinDate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">您的GitHub帐户已成功链接。</p>
            </div>

            <div className="space-y-3">
              <Button onClick={() => router.replace('/chat')} className="w-full h-11">
                开始使用
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.replace('/')}
              >
                回到首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
