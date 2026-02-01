'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ShareModal from './ShareModal'

interface ShareButtonProps {
  sessionId: string
}

export default function ShareButton({ sessionId }: ShareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button
        variant='ghost'
        size='icon'
        className='hover:bg-[rgba(var(--coze-brand-0),var(--coze-brand-3-alpha))] text-[rgba(var(--coze-fg-4),var(--coze-fg-4-alpha))]'
        onClick={handleOpenModal}
      >
        <Share2 className='w-5 h-5' />
      </Button>
      <ShareModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        sessionId={sessionId}
      />
    </>
  )
}
