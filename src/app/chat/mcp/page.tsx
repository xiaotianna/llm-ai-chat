'use client'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ChevronLeft, Package, Plus, Search, CircleHelp } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import McpModal from '@/components/McpModal'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import MCPConfigModal from '@/components/MCPConfigModal'
import { fetchClient } from '@/utils/fetch-client'
import { MCPConfig } from '@/app/api/mcp/route'
import DotLoading from '@/components/DotLoading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const MCPPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const [services, setServices] = useState<MCPConfig[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<MCPConfig | null>(null) // 添加编辑服务状态
  const [loading, setLoading] = useState(true)
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取MCP配置数据
  const fetchMcpConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetchClient<MCPConfig[]>('/api/mcp', {})
      setServices(response.data || [])
    } catch (error) {
      console.error('获取MCP配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMcpConfigs()
  }, [])

  const handleToggleService = async (id: string) => {
    // 设置正在切换的服务ID，用于禁用开关
    setTogglingServiceId(id)
    
    try {
      // 更新本地状态（乐观更新）
      const service = services.find(s => s.id === id)
      if (!service) return
      
      const newStatus = !service.status
      setServices(
        services.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      )
      
      // 发送请求更新服务端状态
      await fetchClient(`/api/mcp/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      })
    } catch (error) {
      // 如果请求失败，回滚状态
      console.error('切换服务状态失败:', error)
      setServices(
        services.map((s) => (s.id === id ? { ...s, status: !s.status } : s))
      )
    } finally {
      // 清除正在切换的服务ID
      setTogglingServiceId(null)
    }
  }

  const handleRemoveService = async () => {
    if (!deletingServiceId) return
    
    setIsDeleting(true)
    try {
      await fetchClient(`/api/mcp/${deletingServiceId}`, {
        method: 'DELETE'
      })
      setServices(services.filter((s) => s.id !== deletingServiceId))
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('删除服务失败:', error)
    } finally {
      setIsDeleting(false)
      setDeletingServiceId(null)
    }
  }

  const handleConfigAdded = () => {
    fetchMcpConfigs()
  }

  const openDeleteDialog = (id: string) => {
    setDeletingServiceId(id)
    setIsDeleteDialogOpen(true)
  }

  // 处理编辑服务
  const handleEditService = (service: MCPConfig) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  // 处理模态框关闭
  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open)
    // 仅在关闭时清空编辑服务，不刷新列表
    if (!open) {
      setEditingService(null)
    }
  }
  
  // 处理保存成功
  const handleSaveSuccess = () => {
    handleConfigAdded() // 刷新列表
    setEditingService(null) // 清空编辑服务
  }

  return (
    <div
      className={
        'h-screen min-h-[600px] flex flex-col w-full relative duration-200 ease-[cubic-bezier(0.65,0,0.35,0)]'
      }
    >
      <header className='border-b border-border bg-background px-2 py-2'>
        <div className='flex items-center'>
          <Button
            size='icon'
            className='h-8 w-8 hover:cursor-pointer bg-transparent hover:bg-transparent'
            onClick={() => {
              router.back()
            }}
          >
            <ChevronLeft className='h-8 w-8 text-black dark:text-white' />
          </Button>
          <p className='font-medium flex items-center gap-3'>
            MCP 服务设置
            <span className='text-xs text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
              请设置当前对话的MCP服务
            </span>
          </p>
        </div>
      </header>
      <div className='mx-auto max-w-7xl px-4 py-4 w-full flex-1 flex flex-col overflow-auto scrollbar-hide'>
        {/* 介绍 */}
        <div className='mb-3 flex items-center gap-6'>
          <div
            className='flex items-center gap-2 text-sm text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))] cursor-pointer hover:text-foreground transition-colors'
            onClick={() => setIsDialogOpen(true)}
          >
            <CircleHelp className='h-4 w-4' />
            <span>MCP平台</span>
          </div>
          <McpModal
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
        {/* 输入框和按钮 */}
        <div className='mb-6 flex items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]' />
            <Input
              placeholder={`搜索MCP服务（共${services.length}个）`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 bg-muted/30'
            />
          </div>
          <Button
            className='ml-auto gap-2 cursor-pointer hover:cursor-pointer bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)]'
            onClick={() => {
              setEditingService(null) // 确保是新增模式
              setIsModalOpen(true)
            }}
          >
            <Plus className='h-4 w-4' />
            添加MCP服务
          </Button>
        </div>
        {/* MCP弹窗 */}
        <MCPConfigModal 
          open={isModalOpen} 
          onOpenChange={handleModalClose}
          onSave={handleSaveSuccess} // 添加保存成功回调
          editData={editingService ? {
            id: editingService.id,
            name: editingService.name,
            type: editingService.mcp_type,
            url: editingService.url,
            description: editingService.desc
          } : null}
        />
        {/* 删除确认弹窗 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
            <DialogHeader>
              <DialogTitle className='text-left text-lg font-semibold'>
                确认删除
              </DialogTitle>
              <DialogDescription className='text-left text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
                确定要删除此MCP服务吗？此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='gap-2 sm:space-x-0'>
              <Button
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                取消
              </Button>
              <Button
                variant='destructive'
                onClick={handleRemoveService}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    删除中
                    <span className='ml-2'>
                      <DotLoading />
                    </span>
                  </>
                ) : (
                  '确认删除'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* 内容 */}
        <div className='flex-1 w-full'>
          {loading ? (
            <div className='flex justify-center items-center h-40'>
              <DotLoading />
            </div>
          ) : services.length > 0 ? (
            <div className='w-full gap-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
              {services
                .filter(service => 
                  service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (service.desc && service.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((service) => (
                <div
                  key={service.id}
                  className='flex items-center justify-between rounded-lg border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] p-4 transition-colors'
                >
                  <div className='flex-1'>
                    <div className='font-medium text-sm text-foreground mb-1'>
                      {service.name}
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {service.desc}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Switch
                      checked={service.status}
                      onCheckedChange={() => handleToggleService(service.id)}
                      disabled={togglingServiceId === service.id}
                    />
                    <Button
                      variant='link'
                      size='sm'
                      className='text-[var(--primary-color)] p-0'
                      onClick={() => handleEditService(service)}
                    >
                      修改
                    </Button>
                    <Button
                      variant='link'
                      size='sm'
                      onClick={() => openDeleteDialog(service.id)}
                      className='text-red-500 p-0'
                    >
                      移除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col w-full h-full items-center justify-center -mt-20'>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia>
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>暂无MCP服务</EmptyTitle>
                  <EmptyDescription className='text-[rgba(var(--coze-fg-2),var(--coze-fg-2-alpha))]'>
                    当前还没有可用的MCP服务，请添加新的服务或检查网络连接。
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MCPPage