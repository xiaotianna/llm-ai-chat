import express from 'express'
import { router as weatherRouter } from './mcp/weather.js'
import { router as baziRouter } from './mcp/bazi.js'

const app = express()
app.use(express.json())
app.use('/mcp', weatherRouter)
app.use('/mcp', baziRouter)

const port = parseInt(process.env.PORT || '4000')
app
  .listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`)
  })
  .on('error', (error) => {
    console.error('Server error:', error)
    process.exit(1)
  })
