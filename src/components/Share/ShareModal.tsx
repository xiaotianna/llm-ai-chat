'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, X, ExternalLink, Link2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
}

export default function ShareModal({
  isOpen,
  onClose,
  sessionId
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [loading, setLoading] = useState(false)

  // 生成分享链接
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/share/${sessionId}`
      : ''

  // 组件挂载时获取当前分享状态
  useEffect(() => {
    if (isOpen && sessionId) {
      checkShareStatus();
    }
  }, [isOpen, sessionId]);

  const checkShareStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${sessionId}`);
      const result = await response.json();
      
      if (result.code === 200) {
        setIsShared(result.data?.is_share || false);
      } else {
        console.error('获取分享状态失败:', result.message);
        toast.error('获取分享状态失败');
      }
    } catch (error) {
      console.error('获取分享状态异常:', error);
      toast.error('获取分享状态失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('链接已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('复制失败')
    }
  }

  const handleOpenLink = () => {
    window.open(shareUrl, '_blank')
  }

  // 创建分享链接
  const handleShare = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_share: true }),
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        setIsShared(true);
        toast.success('分享链接已生成');
      } else {
        console.error('分享失败:', result.message);
        toast.error(result.message || '分享失败');
      }
    } catch (error) {
      console.error('分享异常:', error);
      toast.error('分享失败');
    } finally {
      setLoading(false);
    }
  };

  // 解除分享链接
  const handleCancelShare = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${sessionId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        setIsShared(false);
        toast.success('已取消分享');
      } else {
        console.error('取消分享失败:', result.message);
        toast.error(result.message || '取消分享失败');
      }
    } catch (error) {
      console.error('取消分享异常:', error);
      toast.error('取消分享失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-md bg-[rgba(var(--coze-bg-10),var(--coze-bg-10-alpha))] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>分享会话</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            任何拥有此链接的人都可以查看这个会话
          </DialogDescription>
        </DialogHeader>

        {isShared && (
          <div className='flex items-center gap-2 mt-2'>
            <Input
              value={shareUrl}
              readOnly
              className='flex-1 bg-muted/50 text-sm'
            />
            <Button
              variant='outline'
              size='icon'
              onClick={handleCopy}
              className='shrink-0 bg-transparent cursor-pointer'
            >
              {copied ? (
                <Check className='size-4 text-green-500' />
              ) : (
                <Copy className='size-4' />
              )}
              <span className='sr-only'>复制链接</span>
            </Button>
          </div>
        )}

        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <Link2 className='h-4 w-4' />
          <span>{isShared ? '分享链接已激活' : '分享链接未激活'}</span>
        </div>

        <div className='flex items-center justify-between mt-2'>
          {isShared ? (
            <>
              <Button
                variant='destructive'
                onClick={handleCancelShare}
                disabled={loading}
                className='gap-2 cursor-pointer'
              >
                <X className='size-4' />
                解除分享链接
              </Button>
              <Button
                variant='outline'
                onClick={handleOpenLink}
                className='gap-2 bg-transparent cursor-pointer'
              >
                打开链接
                <ExternalLink className='size-4' />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='outline'
                onClick={handleShare}
                disabled={loading}
                className='gap-2 bg-transparent cursor-pointer ml-auto'
              >
                生成分享链接
                <Share2 className='size-4' />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
