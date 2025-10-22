import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

interface MarkdownRenderProps {
  content: string
  className?: string
}

const MarkdownRender = ({ content, className = '' }: MarkdownRenderProps) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => <h1 className='text-3xl font-bold mt-6 mb-4' {...props} />,
          h2: ({ node, ...props }) => <h2 className='text-2xl font-bold mt-5 mb-3' {...props} />,
          h3: ({ node, ...props }) => <h3 className='text-xl font-bold mt-4 mb-2' {...props} />,
          h4: ({ node, ...props }) => <h4 className='text-lg font-bold mt-3 mb-2' {...props} />,
          h5: ({ node, ...props }) => <h5 className='text-base font-bold mt-2 mb-1' {...props} />,
          h6: ({ node, ...props }) => <h6 className='text-sm font-bold mt-2 mb-1' {...props} />,
          p: ({ node, ...props }) => <p className='my-3 leading-relaxed' {...props} />,
          ul: ({ node, ...props }) => <ul className='list-disc list-inside my-2 ml-4' {...props} />,
          ol: ({ node, ...props }) => <ol className='list-decimal list-inside my-2 ml-4' {...props} />,
          li: ({ node, ...props }) => <li className='my-1' {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className='border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600' {...props} />
          ),
          code: (props: any) => {
            const { node, inline, className, children, ...rest } = props
            const match = /language-(\w+)/.exec(className || '')
            
            if (!inline && match) {
              return (
                <pre className='bg-gray-100 dark:bg-gray-800 rounded p-4 my-4 overflow-x-auto'>
                  <code className={`language-${match[1]}`} {...rest} />
                </pre>
              )
            }
            
            if (inline) {
              return <code className='bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 text-sm font-mono' {...rest} />
            }
            
            return (
              <pre className='bg-gray-100 dark:bg-gray-800 rounded p-4 my-4 overflow-x-auto'>
                <code className='text-sm' {...rest} />
              </pre>
            )
          },
          a: ({ node, ...props }) => (
            <a className='text-blue-600 hover:text-blue-800 underline' target='_blank' rel='noopener noreferrer' {...props} />
          ),
          table: ({ node, ...props }) => (
            <table className='min-w-full border-collapse border border-gray-300 my-4' {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className='border border-gray-300 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-left font-bold' {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className='border border-gray-300 px-4 py-2' {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className='hover:bg-gray-50 dark:hover:bg-gray-800' {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className='border-t border-gray-300 my-6' {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className='max-w-full h-auto rounded-lg my-4' {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className='font-bold' {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className='italic' {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRender