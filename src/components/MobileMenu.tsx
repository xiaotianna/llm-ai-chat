'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavMenusType } from './Navbar'
import Link from 'next/link'
import { useUserStore } from '@/store/user'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { USER_TYPE_MAP } from '@/constant/common'

interface MobileMenuProps {
  className?: string
  navMenus: NavMenusType
}

export default function MobileMenu({ className, navMenus }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const { user, clearUser } = useUserStore()
  const router = useRouter()

  // 退出登录处理
  const handleLogout = async () => {
    try {
      await clearUser()
      toast.success('退出登录成功')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('退出登录失败，请重试')
    }
  }

  // 控制body滚动
  useEffect(() => {
    if (isOpen) {
      // 菜单打开时禁止body滚动
      document.body.style.overflow = 'hidden'
    } else {
      // 菜单关闭时恢复body滚动
      document.body.style.overflow = 'unset'
    }

    // 清理函数，组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (isOpen) {
      setExpandedSection(null)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3
      }
    }
  }

  const itemVariants = {
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    }
  }

  const sectionVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <div className={`md:hidden ${className}`}>
      {/* 菜单按钮 */}
      <div
        onClick={toggleMenu}
        className='mr-2'
        aria-label='Toggle menu'
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </div>

      {/* 折叠面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className='fixed inset-0 bg-transparent z-40'
            />

            {/* 菜单内容 */}
            <motion.div
              initial='closed'
              animate='open'
              exit='closed'
              variants={menuVariants}
              className='absolute top-full left-0 right-0 bg-gray-100 dark:bg-[#212534] backdrop-blur-xl border-b border-border shadow-2xl overflow-hidden z-50'
            >
              <div className='container mx-auto py-4 px-4 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide'>
                {/* 用户信息区域 */}
                {user ? (
                  <>
                    <motion.div
                      variants={itemVariants}
                      className='flex items-center gap-3 rounded-lg mb-4'
                    >
                      <img
                        src={user.avatar}
                        alt='User avatar'
                        className='w-12 h-12 rounded-full border-2 border-background'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg?height=48&width=48'
                        }}
                      />
                      <div className='flex-1'>
                        <div className='text-base font-semibold text-foreground'>
                          {user.name}
                        </div>
                        <div className='text-sm text-green-500 font-medium'>
                          {USER_TYPE_MAP[user.type]}
                        </div>
                      </div>
                    </motion.div>
                    {/* 退出登录按钮 */}
                    <motion.div variants={itemVariants}>
                      <Button
                        onClick={handleLogout}
                        className='w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded-lg h-11 text-base font-medium'
                      >
                        退出登录
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={itemVariants}>
                    <Button
                      onClick={() => router.push('/login')}
                      className='w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded-lg h-11 text-base font-medium'
                    >
                      登录
                    </Button>
                  </motion.div>
                )}
                {/* 分隔线 */}
                <motion.div
                  variants={itemVariants}
                  className='border-t border-border/50 mb-0'
                ></motion.div>
                {/* 对应桌面端导航菜单部分 */}
                {navMenus.map((item) => {
                  return item.children ? (
                    <motion.div
                      variants={itemVariants}
                      key={item.name}
                    >
                      <button
                        onClick={() => toggleSection(item.name)}
                        className='flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                      >
                        <span className='text-base font-medium'>
                          {item.name}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground transition-transform ${
                            expandedSection === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedSection === item.name && (
                          <motion.div
                            initial='closed'
                            animate='open'
                            exit='closed'
                            variants={sectionVariants}
                            className='ml-2 space-y-1 overflow-hidden flex flex-col'
                          >
                            {item.children.map((child) => {
                              const IconComponent = child.icon
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className='group flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                                >
                                  {IconComponent && (
                                    <div className='flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors'>
                                      <IconComponent className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                                    </div>
                                  )}
                                  <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2 mb-0.5'>
                                      <h3 className='font-semibold text-gray-900 dark:text-white text-sm leading-none'>
                                        {child.name}
                                      </h3>
                                      {child.badge && (
                                        <span className='px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full'>
                                          {child.badge}
                                        </span>
                                      )}
                                    </div>
                                    {child.description && (
                                      <p className='text-xs text-gray-600 dark:text-gray-400 leading-relaxed'>
                                        {child.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={itemVariants}
                      className='space-y-2'
                      key={item.name}
                    >
                      <Link
                        href='/docs'
                        className='block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                      >
                        <span className='text-base font-medium'>
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
