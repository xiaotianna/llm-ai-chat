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

// 定义 MCP 配置的 Zod schema
const mcpConfigSchema = z.object({
  mcpServers: z.record(
    z.string(),
    z.object({
      type: z.enum(['sse', 'streamable']),
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
  const [errors, setErrors] = useState<{
    json: string | JsonError[]
  }>({
    json: ''
  })

  const currentOpen = open !== undefined ? open : isOpen

  // dialog打开回调
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
  }

  // 表单字段变化回调
  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // 对表单内容进行校验
  const validateForm = () => {
    let isValid = true

    if (!formData.name.trim()) {
      isValid = false
    }

    if (!formData.url.trim()) {
      isValid = false
    }

    return isValid
  }

  const handleJsonChange = (value: string) => {
    setJsonValue(value)

    // 实时校验 JSON
    if (value.trim()) {
      try {
        const parsedJson = JSON.parse(value)
        const result = mcpConfigSchema.safeParse(parsedJson)

        if (!result.success) {
          const zodErrors: JsonError[] = result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
          setErrors((prev) => ({
            ...prev,
            json: zodErrors
          }))
        } else {
          // 校验通过，清空错误
          setErrors((prev) => ({
            ...prev,
            json: ''
          }))
        }
      } catch (e) {
        setErrors((prev) => ({
          ...prev,
          json: 'JSON格式不正确'
        }))
      }
    } else {
      // 空值情况，只在提交时校验，不在输入过程中显示错误
      setErrors((prev) => ({
        ...prev,
        json: ''
      }))
    }
  }

  const validateJson = () => {
    let newJsonError: string | JsonError[] = ''
    let isValid = true

    if (activeTab === 'json' && !jsonValue.trim()) {
      newJsonError = 'JSON配置不能为空'
      isValid = false
    }

    if (activeTab === 'json' && jsonValue.trim()) {
      try {
        const parsedJson = JSON.parse(jsonValue)

        // 使用 Zod 验证 JSON 结构
        const result = mcpConfigSchema.safeParse(parsedJson)

        if (!result.success) {
          // 转换 Zod 错误为更友好的格式
          const zodErrors: JsonError[] = result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
          newJsonError = zodErrors
          isValid = false
        }
      } catch (e) {
        newJsonError = 'JSON格式不正确'
        isValid = false
      }
    }

    setErrors((prev) => ({
      ...prev,
      json: newJsonError
    }))

    return isValid
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      let isValid = true

      if (activeTab === 'form') {
        isValid = validateForm()
      } else {
        isValid = validateJson()
      }

      if (!isValid) {
        setIsLoading(false)
        return
      }

      // 这里添加提交逻辑
      if (activeTab === 'form') {
        // 处理表单提交
        console.log('Form data:', formData)
      } else {
        // 处理JSON提交
        try {
          const parsedJson = JSON.parse(jsonValue)
          console.log('JSON data:', parsedJson)
        } catch (e) {
          console.error('JSON parse error:', e)
        }
      }

      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      handleOpenChange(false)
    } catch (error) {
      console.error('Submit error:', error)
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
                  className='focus-visible:ring-[var(--primary-color)] focus-visible:ring-[3px]'
                />
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
                      value='streamable'
                      id='type-streamable'
                      className='data-[state=checked]:border-[var(--primary-color)] data-[state=checked]:text-[var(--primary-color)]'
                    />
                    <Label htmlFor='type-streamable'>Streamable HTTP</Label>
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
                  className='focus-visible:ring-[var(--primary-color)] focus-visible:ring-[3px]'
                />
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
            disabled={
              isLoading ||
              (activeTab === 'form' &&
                (!formData.name || !formData.type || !formData.url))
            }
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
