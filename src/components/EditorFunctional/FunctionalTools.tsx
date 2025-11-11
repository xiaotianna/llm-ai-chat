import React, { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Package } from 'lucide-react'
import { fetchClient } from '@/utils/fetch-client'
import type { MCPConfig } from '@/app/api/mcp/route'
import { ToolsIcon } from '../icon/tools-icon'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import { useRouter } from 'next/navigation'
import DownIcon from '../icon/down-icon'

interface ServiceConfig {
  id: string
  name: string
  status: boolean
}

const FunctionalTools = () => {
  const [services, setServices] = useState<ServiceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(
    null
  )
  const router = useRouter()

  // 获取MCP配置数据
  const fetchMcpConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetchClient<MCPConfig[]>('/api/mcp', {})
      const serviceConfigs = (response.data || []).map((service) => ({
        id: service.id,
        name: service.name,
        status: service.status ?? false
      }))
      setServices(serviceConfigs)
    } catch (error) {
      console.error('获取MCP配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMcpConfigs()
  }, [])

  const handleToggleAll = async (checked: boolean) => {
    // 批量更新所有服务状态
    const updatePromises = services.map((service) =>
      fetchClient(`/api/mcp/${service.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: checked
        })
      })
    )

    try {
      setServices(
        services.map((service) => ({
          ...service,
          status: checked
        }))
      )

      // 等待所有请求完成
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('批量更新失败:', error)
      // 如果失败，重新获取最新状态
      fetchMcpConfigs()
    }
  }

  const handleToggleService = async (id: string, checked: boolean) => {
    setUpdatingServiceId(id)

    try {
      // 乐观更新UI
      setServices(
        services.map((service) =>
          service.id === id ? { ...service, status: checked } : service
        )
      )

      // 发送请求更新服务状态
      await fetchClient(`/api/mcp/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: checked
        })
      })
    } catch (error) {
      console.error('更新服务状态失败:', error)
      // 如果失败，重新获取最新状态
      fetchMcpConfigs()
    } finally {
      setUpdatingServiceId(null)
    }
  }

  // 检查是否所有服务都已启用
  const allEnabled =
    services.length > 0 && services.every((service) => service.status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          data-slot='button'
          className="justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 shrink-0 [&_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer transition has-[>svg]:px-3 flex h-[32px] rounded-[100px] items-center gap-1 px-3 py-1 border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] bg-[rgba(var(--coze-bg-3), var(--coze-bg-3-alpha))] text-[rgba(var(--coze-fg-3), var(--coze-fg-3-alpha))] hover:bg-[rgba(var(--coze-bg-5),var(--coze-bg-5-alpha))]"
        >
          <ToolsIcon />
          <span className='font-medium text-sm'>MCP工具</span>
          <DownIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        avoidCollisions={false}
        className='flex border cursor-pointer w-[300px] rounded-lg flex-col px-1 py-2 gap-0.5 max-h-60'
      >
        {/* MCP管理项 */}
        <div
          className='flex items-center px-2 py-1'
          onSelect={(e) => e.preventDefault()}
        >
          <div className='flex items-center gap-2'>
            <Package className='h-4 w-4' />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className='font-medium text-sm' onClick={() => router.push('/chat/mcp')}>
                  MCP
                  <Button
                    variant={'link'}
                    className='cursor-pointer ml-0.5 px-0 text-[var(--primary-color)]'
                    size={'sm'}
                  >
                    管理
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>点击跳转“MCP管理”</TooltipContent>
            </Tooltip>
          </div>
          <div className='flex items-center gap-2 ml-auto'>
            <span className='font-medium text-sm'>全部</span>
            <Switch
              className='cursor-pointer'
              checked={allEnabled}
              onCheckedChange={handleToggleAll}
              disabled={services.length === 0}
            />
          </div>
        </div>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <div className='w-full flex justify-center items-center gap-2'>
            <Button
              size={'sm'}
              className='flex-1 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] cursor-pointer'
            >
              新增
            </Button>
          </div>
        </DropdownMenuItem>
        {/* 分割线 */}
        <Separator className='my-1' />
        {/* MCP配置列表 */}
        {services.length > 0 ? (
          services.map((service) => (
            <DropdownMenuItem
              key={service.id}
              className='flex items-center justify-between py-2'
              onSelect={(e) => e.preventDefault()}
            >
              <span className='text-sm truncate max-w-[150px]'>
                {service.name}
              </span>
              <Switch
                className='cursor-pointer'
                checked={service.status}
                onCheckedChange={(checked) =>
                  handleToggleService(service.id, checked)
                }
                disabled={updatingServiceId === service.id}
              />
            </DropdownMenuItem>
          ))
        ) : (
          <div className='text-center py-4 text-sm text-muted-foreground'>
            暂无MCP配置
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FunctionalTools
