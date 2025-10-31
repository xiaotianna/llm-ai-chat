import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import MarkdownRender from './MarkdownRender'
import DotLoading from './DotLoading'

interface McpModal {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const McpModal = ({ open, onOpenChange }: McpModal) => {
  const [isOpen, setIsOpen] = useState(false)
  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
  }

  const currentOpen = open !== undefined ? open : isOpen

  // 加载 markdown 文件内容
  React.useEffect(() => {
    const loadMarkdownContent = async () => {
      if (!currentOpen) return
      
      setLoading(true)
      try {
        const response = await fetch('/api/docs/mcp-info')
        const data = await response.json()
        setMarkdownContent(data.content)
      } catch (error) {
        console.error('Failed to load markdown content:', error)
        setMarkdownContent('无法加载内容')
      } finally {
        setLoading(false)
      }
    }

    loadMarkdownContent()
  }, [currentOpen])

  return (
    <Dialog
      open={currentOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className='sm:max-w-[425px] bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
        <DialogHeader>
          <DialogTitle>MCP平台说明</DialogTitle>
        </DialogHeader>
        <div className='py-4 text-popover-foreground'>
          {loading ? (
            <div className='flex justify-center items-center h-24'>
              <DotLoading />
            </div>
          ) : (
            <MarkdownRender className='max-h-100 overflow-auto'>{markdownContent}</MarkdownRender>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default McpModal