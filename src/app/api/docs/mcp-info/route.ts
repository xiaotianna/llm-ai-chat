import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const markdownPath = path.join(process.cwd(), 'src', 'docs', 'mcp-info.md')
    const fileContents = await fs.readFile(markdownPath, 'utf8')
    const { content } = matter(fileContents)
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Failed to load markdown content:', error)
    return NextResponse.json({ content: '无法加载内容' }, { status: 500 })
  }
}