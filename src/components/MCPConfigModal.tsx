import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import DotLoading from './DotLoading'
import { z } from 'zod'
import { fetchClient } from '@/utils/fetch-client'

// 定义 MCP 配置的 Zod schema
const mcpConfigSchema = z.object({
  mcpServers: z.record(
    z.string(),
    z.object({
      type: z.enum(['sse', 'streamable_http']),
      url: z.string().url(),
      description: z.string().optional()
    })
  )
})

// 定义验证错误类型
type JsonError = {
  path?: string
  message: string
}

interface MCPConfigModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const MCPConfigModal = ({ open, onOpenChange }: MCPConfigModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('form')
  const [formData, setFormData] = useState({
    name: '',
    type: 'sse',
    url: '',
    description: ''
  })
  const [jsonValue, setJsonValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    form: {
      name: '',
      url: ''
    },
    json: [] as JsonError[] | string
  })

  const currentOpen = open !== undefined ? open : isOpen
  // dialog打开回调
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
    // 重置表单和错误
    if (!newOpen) {
      setFormData({
        name: '',
        type: 'sse',
        url: '',
        description: ''
      })
      setJsonValue('')
      setErrors({
        form: {
          name: '',
          url: ''
        },
        json: []
      })
      setActiveTab('form')
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (field === 'name' || field === 'url') {
      setErrors(prev => ({
        ...prev,
        form: {
          ...prev.form,
          [field]: ''
        }
      }))
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonValue(value)
    // 清除JSON错误
    setErrors(prev => ({
      ...prev,
      json: []
    }))
  }

  const validateForm = () => {
    const newErrors = {
      form: {
        name: '',
        url: ''
      },
      json: [] as JsonError[] | string
    }
    
    let isValid = true
    
    if (!formData.name.trim()) {
      newErrors.form.name = '名称不能为空'
      isValid = false
    }
    
    if (!formData.url.trim()) {
      newErrors.form.url = 'URL不能为空'
      isValid = false
    } else if (!isValidUrl(formData.url)) {
      newErrors.form.url = '请输入有效的URL'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }
  
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString)
      return true
    } catch (err) {
      return false
    }
  }
  
  const validateJson = () => {
    if (!jsonValue.trim()) {
      setErrors(prev => ({
        ...prev,
        json: 'JSON不能为空'
      }))
      return false
    }
    
    try {
      const parsed = JSON.parse(jsonValue)
      const result = mcpConfigSchema.safeParse(parsed)
      
      if (result.success) {
        // 检查是否有服务配置
        if (!parsed.mcpServers || Object.keys(parsed.mcpServers).length === 0) {
          setErrors(prev => ({
            ...prev,
            json: '至少需要配置一个MCP服务'
          }))
          return false
        }
        return true
      } else {
        // Zod验证失败，格式化错误信息
        const formattedErrors: JsonError[] = result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
        setErrors(prev => ({
          ...prev,
          json: formattedErrors
        }))
        return false
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        json: '无效的JSON格式'
      }))
      return false
    }
  }
  
  const handleSubmit = async () => {
    if (activeTab === 'form') {
      if (!validateForm()) return
      // 处理表单提交
      await submitFormConfig()
    } else {
      if (!validateJson()) return
      // 处理JSON提交
      await submitJsonConfig()
    }
  }
  
  const submitFormConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetchClient('/api/mcp', {
        method: 'POST',
        body: JSON.stringify({
          mcp_type: formData.type,
          name: formData.name,
          url: formData.url,
          desc: formData.description
        })
      })
      
      // 提交成功，关闭模态框
      handleOpenChange(false)
    } catch (error) {
      console.error('提交出错:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const submitJsonConfig = async () => {
    setIsLoading(true)
    try {
      const parsed = JSON.parse(jsonValue)
      const servers = parsed.mcpServers
      
      // 批量提交所有配置
      const promises = Object.entries(servers).map(([name, config]: [string, any]) => {
        return fetchClient('/api/mcp', {
          method: 'POST',
          body: JSON.stringify({
            mcp_type: config.type,
            name: name,
            url: config.url,
            desc: config.description
          })
        })
      })
      
      const results = await Promise.allSettled(promises)
      
      // 检查是否有失败的请求
      const failed = results.filter(result => result.status === 'rejected')
      if (failed.length > 0) {
        console.error('部分配置提交失败:', failed)
      }
      
      // 关闭模态框
      handleOpenChange(false)
    } catch (error) {
      console.error('提交出错:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={currentOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className='sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
        <DialogHeader>
          <DialogTitle className='text-left text-lg font-semibold'>
            MCP配置
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-2 bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))]'>
            <TabsTrigger
              value='form'
              className='data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white data-[state=active]:font-semibold data-[state=inactive]:text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]'
            >
              表单添加
            </TabsTrigger>
            <TabsTrigger
              value='json'
              className='data-[state=active]:bg-[var(--primary-color)] data-[state=active]:text-white data-[state=active]:font-semibold data-[state=inactive]:text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))]'
            >
              JSON添加
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value='form'
            className='space-y-6 mt-4'
          >
            <div className='space-y-6'>
              <div className='space-y-3'>
                <Label
                  htmlFor='name'
                  className='mb-4 block'
                >
                  名称 <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder='请输入名称'
                  className={`focus-visible:ring-[var(--primary-color)] focus-visible:ring-[3px] ${
                    errors.form.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.form.name && (
                  <div className='text-red-500 text-sm'>{errors.form.name}</div>
                )}
              </div>

              <div className='space-y-3'>
                <Label
                  htmlFor='type'
                  className='mb-4 block'
                >
                  类型 <span className='text-red-500'>*</span>
                </Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => handleFormChange('type', value)}
                  className='flex space-x-4'
                >
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='sse'
                      id='type-sse'
                      className='data-[state=checked]:border-[var(--primary-color)] data-[state=checked]:text-[var(--primary-color)]'
                    />
                    <Label htmlFor='type-sse'>SSE</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='streamable_http'
                      id='type-streamable_http'
                      className='data-[state=checked]:border-[var(--primary-color)] data-[state=checked]:text-[var(--primary-color)]'
                    />
                    <Label htmlFor='type-streamable_http'>
                      Streamable HTTP
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className='space-y-3'>
                <Label
                  htmlFor='url'
                  className='mb-4 block'
                >
                  URL链接 <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='url'
                  value={formData.url}
                  onChange={(e) => handleFormChange('url', e.target.value)}
                  placeholder='请输入URL链接'
                  className={`focus-visible:ring-[var(--primary-color)] focus-visible:ring-[3px] ${
                    errors.form.url ? 'border-red-500' : ''
                  }`}
                />
                {errors.form.url && (
                  <div className='text-red-500 text-sm'>{errors.form.url}</div>
                )}
              </div>

              <div className='space-y-3'>
                <Label
                  htmlFor='description'
                  className='mb-4 block'
                >
                  描述
                </Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange('description', e.target.value)
                  }
                  placeholder='请输入描述'
                  className='focus-visible:ring-[var(--primary-color)] focus-visible:ring-[3px]'
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value='json'
            className='mt-4'
          >
            <div className='space-y-6'>
              <div className='space-y-3'>
                <Label
                  htmlFor='json'
                  className='mb-4 block'
                >
                  JSON <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                  id='json'
                  value={jsonValue}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder={`{
  "mcpServers": {
    "fetch": {
      "type": "sse",
      "url": "mcp server sse url",
      "description": "mcp server description"
    }
  }
}`}
                  className={`min-h-[200px] focus-visible:ring-[var(--primary-color)] focus-visible:ring-[3px] ${
                    (Array.isArray(errors.json) && errors.json.length > 0) ||
                    (typeof errors.json === 'string' && errors.json !== '')
                      ? 'border-red-500'
                      : ''
                  }`}
                />
                {errors.json && (
                  <div className='text-red-500 text-sm mt-1'>
                    {Array.isArray(errors.json) ? (
                      <ul className='list-disc list-inside'>
                        {errors.json.map((error, index) => (
                          <li key={index}>
                            {error.path
                              ? `${error.path}: ${error.message}`
                              : error.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      errors.json
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className='flex justify-end gap-2 pt-4'>
          <Button
            variant='outline'
            onClick={() => handleOpenChange(false)}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='bg-[var(--primary-color)] hover:bg-[var(--primary-color)]'
          >
            {isLoading ? (
              <>
                确认
                <span className='ml-2'>
                  <DotLoading />
                </span>
              </>
            ) : (
              '确认'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MCPConfigModal