import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: 'src/docs-content'
})

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      lazy: true,
      themes: {
        light: 'catppuccin-latte',
        dark: 'catppuccin-mocha'
      }
    }
  }
})
