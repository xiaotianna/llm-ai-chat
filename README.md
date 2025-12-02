# AI Chat 🌍

AI Chat 是一个基于 Next.js 15 和 React 19 构建的现代化 AI 聊天应用。该项目集成了多种 AI 模型服务，包括 OpenRouter 和 Ollama，并使用 Supabase 作为后端服务。支持 Agent 多轮对话，以及 MCP 工具调用。

## 技术栈

- **框架**: Next.js 15 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件库**: Radix UI + shadcn/ui
- **状态管理**: Zustand
- **后端数据库服务**: Supabase
- **AI 服务**: OpenRouter, Ollama

## 环境变量配置

在项目根目录下创建 `.env.local` 文件，并填入以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter 配置 (可选)
NEXT_PUBLIC_OPENROUTER_KEY=your_openrouter_api_key

# Ollama 配置 (可选)
NEXT_PUBLIC_OLLAMA_API_KEY=your_ollama_api_key
NEXT_PUBLIC_OLLAMA_HOST=http://localhost:11434
```

### 环境变量说明

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名访问密钥
- `NEXT_PUBLIC_OPENROUTER_KEY`: OpenRouter API 密钥 (用于访问各种大语言模型)
- `NEXT_PUBLIC_OLLAMA_API_KEY`: Ollama API 密钥 (本地模型服务)
- `NEXT_PUBLIC_OLLAMA_HOST`: Ollama 服务地址 (默认为 http://localhost:11434)

## 如何启动项目

### 前置要求

- Node.js >= 20
- pnpm 包管理器
- 如需使用 Ollama 服务，需要先安装并启动 Ollama

### 安装依赖

```bash
pnpm install
```

### 开发模式启动

```bash
pnpm dev
```

项目将在 `http://localhost:3000` 上运行。

### 开发模式运行 MCP 服务器 `mcp-server`

```bash
cd ./mcp-server
pnpm run server
```

### 构建生产版本

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

## 项目结构

```
.
├── mcp-server/           # MCP 服务模块
├── src/
│   ├── app/              # 应用路由
│   ├── components/       # React 组件
│   ├── config/           # 配置文件
│   ├── constant/         # 常量定义
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具库
│   ├── services/         # 业务服务
│   ├── store/            # 状态管理
│   ├── types/            # TypeScript 类型定义
│   └── utils/            # 工具函数
├── public/               # 静态资源
```

## License

MIT
