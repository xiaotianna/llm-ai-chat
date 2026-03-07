# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本项目中工作时提供指导。

## 项目概述

AI Chat 是一个基于 Next.js 15 和 React 19 构建的现代化 AI 聊天应用。集成了多种 AI 模型服务（OpenRouter 和 Ollama），使用 Supabase 作为后端。支持 Agent 多轮对话以及 MCP（Model Context Protocol）工具调用。

## 常用命令

```bash
# 开发
pnpm dev                    # 启动开发服务器 http://localhost:3000
pnpm build                  # 构建生产版本
pnpm start                  # 启动生产服务器
pnpm lint                   # 运行 Next.js lint

# Docker 部署
pnpm docker:build           # 构建 Docker 镜像
pnpm docker:up              # 启动 Docker 容器
pnpm docker:down            # 停止 Docker 容器

# MCP 服务器（独立模块）
cd ./mcp-server && pnpm run server   # 在端口 4000 启动 MCP 服务器
```

## 环境变量

在项目根目录创建 `.env.local` 文件：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_OPENROUTER_KEY` - OpenRouter API 密钥（可选）
- `NEXT_PUBLIC_OLLAMA_API_KEY` - Ollama API 密钥（可选）
- `NEXT_PUBLIC_OLLAMA_HOST` - Ollama 服务地址（默认：http://localhost:11434）

## 架构

### 技术栈
- **框架**: Next.js 15 (App Router) + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS v4 + Radix UI + shadcn/ui 组件
- **状态管理**: Zustand
- **数据库/认证**: Supabase（GitHub OAuth）
- **AI 服务**: OpenRouter, Ollama（通过 `ai` SDK）
- **MCP**: Model Context Protocol 工具调用

### 目录结构

```
src/
├── app/                    # Next.js App Router（页面 + API 路由）
│   ├── api/               # API 路由（conversation, history, mcp, share）
│   ├── chat/              # 聊天页面（main, [id], mcp）
│   ├── login/             # 登录页面（GitHub OAuth）
│   └── share/[id]/        # 对话分享页面
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 基础组件
│   ├── Editor.tsx         # 主聊天编辑器
│   ├── EditorFunctional/  # 模型/工具配置面板
│   ├── Message/           # 聊天消息组件（AI、用户、工具）
│   ├── Share/             # 分享功能组件
│   └── ...
├── config/
│   ├── model/             # AI 模型配置（Qwen3、DeepSeekR1）
│   ├── supabase.ts        # Supabase 客户端
│   └── supabase-admin.ts  # Supabase 管理员客户端
├── hooks/                 # 自定义 React Hooks（useSSE, useCopyToClipboard, useMobile）
├── services/              # 业务服务
│   ├── chat/              # 聊天服务（标题生成）
│   ├── conversation/      # 对话 CRUD
│   ├── history/           # 聊天历史
│   └── mcp/               # MCP 工具定义
├── store/                 # Zustand 状态管理
│   ├── editor.ts         # 聊天编辑器状态（模型、加载状态、缓存消息）
│   ├── history.ts         # 对话历史列表状态
│   └── user.ts            # 用户认证状态
├── types/                 # TypeScript 类型定义
│   └── model/             # 模型配置类型
└── utils/                 # 工具函数
    ├── ollama.ts          # Ollama 客户端封装
    ├── open-ai.ts         # OpenAI/OpenRouter 客户端封装
    └── response-message.ts # API 响应 helpers

mcp-server/                # 独立 MCP 服务器（Express）
├── index.ts               # 服务器入口
├── mcp/                   # MCP 工具实现
│   ├── bazi.ts           # 八字算命工具
│   ├── weather.ts        # 天气查询工具
│   └── weather-mock.ts   # 模拟天气工具
└── package.json
```

### 关键模式

1. **AI 集成**: 使用 `ai` SDK（`ai` 包）提供统一的 AI API。Ollama 和 OpenRouter 封装在 `src/utils/` 中。

2. **MCP 工具**: MCP 工具定义在 `src/services/mcp/`，通过 `mcp-server/` 暴露。聊天 UI 允许为 AI Agent 选择工具。

3. **状态管理**: `src/store/` 中的 Zustand stores 管理：
   - `editor.ts` - 当前模型、加载状态、缓存消息
   - `history.ts` - 对话历史列表
   - `user.ts` - 已认证用户信息

4. **API 路由**: 所有后端逻辑位于 `src/app/api/`：
   - `/api/conversation` - 对话 CRUD
   - `/api/chat` - AI 聊天端点（转发到 OpenRouter/Ollama）
   - `/api/mcp` - MCP 工具注册和执行
   - `/api/share` - 对话公开分享链接

5. **认证**: 通过 Supabase Auth 实现 GitHub OAuth。用户信息存储在 cookies 中。

### 模型配置

模型配置位于 `src/config/model/`。每个模型定义：
- `name` - 模型标识符
- `model` - 下游模型 ID
- `provider` - 'open-router' 或 'ollama'
- `models` - 可用的子模型

当前模型：Qwen3-0.6b、DeepSeek-R1

### MCP 服务器

MCP 服务器独立运行（`cd mcp-server && pnpm run server`），端口 4000。通过 Express 路由 `/mcp/*` 暴露工具。主应用通过 HTTP 与其通信。
