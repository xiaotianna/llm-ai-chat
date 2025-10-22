// .source文件夹将在您运行`next dev时生成`
import { docs } from '@/.source'
import { loader } from 'fumadocs-core/source'
import { defineConfig } from 'fumadocs-mdx/config'
import { icons } from 'lucide-react'
import { createElement } from 'react'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  icon(icon) {
    if (!icon) {
      return
    }
    if (icon in icons) return createElement(icons[icon as keyof typeof icons])
  }
})

export default defineConfig({
  mdxOptions: {
    remarkCodeTabOptions: {
      parseMdx: true,
    }
  }
})
