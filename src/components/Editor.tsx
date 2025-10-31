'use client'
import React, { useEffect, useRef, useState } from 'react'
import styles from './HomeDefault.module.css'
import EditorFunctional from './EditorFunctional'
import SendMessageIcon from './icon/sendMessage-icon'
import { useEditorStore } from '@/store/editor'
import { Sparkles } from 'lucide-react'

interface EditorProps {
  onInput?: (value: string) => void
  onSend?: (message: string) => void
  showStop?: boolean // 是否展示停止按钮
  isDone?: boolean
  handleStop?: () => void
}

const Editor = ({
  onInput,
  onSend,
  showStop = false,
  isDone = false,
  handleStop
}: EditorProps) => {
  const editableRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState<string>('')
  const isLoading = useEditorStore.getState().isLoading

  useEffect(() => {
    if (onInput) {
      onInput(content)
    }
  }, [content])

  return (
    <div className='border w-full p-4 relative rounded-2xl bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] shadow-[0px_2px_6px_0px_rgba(var(--coze-shadow-0),.04),0px_4px_12px_0px_rgba(var(--coze-shadow-0),.02)] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))'>
      {/* 停止按钮 */}
      {showStop && !isDone && (
        <div
          onClick={handleStop}
          className='absolute border-2 cursor-pointer gap-2 select-none -top-12 left-1/2 rounded-2xl transform -translate-x-1/2 px-6 py-1 flex items-center bg-[rgba(var(--coze-bg-3),var(--coze-bg-3-alpha))] shadow-[0px_2px_6px_0px_rgba(var(--coze-shadow-0),.04),0px_4px_12px_0px_rgba(var(--coze-shadow-0),.02)] border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))'
        >
          <Sparkles className='w-4 h-4 text-[var(--primary-color)]' />
          <span className='text-sm'>停止</span>
        </div>
      )}
      <div className='p-0 pb-0 relative'>
        <p
          contentEditable={true}
          data-placeholder='发送消息...'
          data-tribute='true'
          spellCheck={false}
          className={`${styles['input-area']} w-full text-base text-[rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))] min-h-[62px] max-h-[222px] transition-all overflow-y-auto whitespace-pre-wrap caret-[1px] border-none rounded-none outline-none resize-none p-0 focus:ring-0 focus-visible:border-ring focus-visible:ring-[0px] focus:shadow-none focus:outline-none shadow-none empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--coz-fg-secondary,#2029459e)] empty:before:block`}
          ref={editableRef}
          // contentEditable 元素不支持 onChange 事件
          onInput={(e) => {
            const el = e.currentTarget
            setContent(el.textContent?.trim() || '')
            // 删除所有 <br> 和空白内容
            if (!el.textContent?.trim()) {
              el.innerHTML = ''
              el.setAttribute('data-empty', 'true')
            } else {
              el.removeAttribute('data-empty')
            }
          }}
          onFocus={(e) => {
            const el = e.currentTarget
            if (!el.textContent?.trim()) {
              el.setAttribute('data-empty', 'true')
            }
          }}
          onBlur={(e) => {
            const el = e.currentTarget
            if (!el.textContent?.trim()) {
              el.setAttribute('data-empty', 'true')
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            // 获取纯文本内容
            const text = (e.clipboardData || window.Clipboard).getData('text')
            // 插入纯文本
            document.execCommand('insertText', false, text)
          }}
        ></p>
      </div>
      <div className='flex pt-2 items-center justify-between'>
        {/* 左侧功能按钮 */}
        <EditorFunctional />
        {/* 右侧发送按钮 */}
        <button
          data-slot='button'
          className="gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-45 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4.5 shrink-0 [&amp;_svg]:shrink-0 outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border border-[rgba(var(--coze-stroke-5),var(--coze-stroke-5-alpha))] hover:bg-[rgba(var(--coze-brand-2),var(--coze-brand-2-alpha))] flex w-[48px] h-[32px] items-center border-none justify-center py-1 px-4 cursor-pointer rounded-full transition-all has-[>svg]:px-4 bg-[#5147FF]"
          disabled={content.length === 0 || isLoading}
          onClick={() => {
            if (onSend && content.trim()) {
              onSend(content.trim())
              // 清空输入框
              if (editableRef.current) {
                editableRef.current.textContent = ''
                editableRef.current.setAttribute('data-empty', 'true')
              }
              setContent('')
            }
          }}
        >
          {isLoading ? (
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
          ) : (
            <SendMessageIcon />
          )}
        </button>
      </div>
    </div>
  )
}

export default Editor
