import { useTheme } from 'next-themes'
import { Github, Link, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Button } from './ui/button'

export function GitRepoToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 rounded-full'
        >
          <Github className='h-[1.2rem] w-[1.2rem]' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        className='rounded-xl w-36'
      >
        <DropdownMenuItem
          className='flex items-center gap-2 cursor-pointer'
          onClick={() =>
            window.open('https://github.com/xiaotianna/ai-chat', '_blank')
          }
        >
          <Link className='h-4 w-4' />
          <span>Github</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className='flex items-center gap-2 cursor-pointer'
          onClick={() =>
            window.open('https://gitee.com/wifi-skew-f/ai-chat', '_blank')
          }
        >
          <Link className='h-4 w-4' />
          <span>Gitee</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
