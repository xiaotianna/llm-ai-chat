# Dockerfile 就是用来定义和创建 Docker 镜像的核心文件

# ======================== 阶段1：构建阶段（builder）========================

# 安装 node 环境
# builder 是你自定义的阶段名称，只要后续COPY --from=里的名称对应上就行
FROM node:22-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm@7

# 设置工作目录（后续所有命令都在 /app 下执行）
WORKDIR /app

# 4. 复制依赖清单文件（先复制 lock 文件，利用 Docker 缓存，加速重复构建）
COPY pnpm-lock.yaml package.json ./
COPY mcp-server/package.json mcp-server/pnpm-lock.yaml ./mcp-server/

# 5. 安装依赖
RUN pnpm install
RUN cd mcp-server && pnpm install

# 6. 复制项目所有源码（注意 .dockerignore 要排除 node_modules 等无用文件）
# 把宿主机文件复制到容器
COPY . .

# 7. 构建 Next.js 项目
RUN pnpm build

# ======================== 阶段2：运行阶段（runner）========================
FROM node:22-alpine AS runner

RUN npm install -g pnpm@7

WORKDIR /app

ENV NODE_ENV=production

# 创建非root用户（安全最佳实践）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从 builder 阶段复制运行所需的文件（只复制需要的，精简体积）
# 核心文件：package.json（项目清单）、next.config.ts/js（配置）、public（静态资源）、build（构建产物）、node_modules（生产依赖）、.env.local（环境变量）
# --from=builder 表示从构建阶段复制
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.env.local ./.env.local
# 如果是 js 就改成 next.config.js
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

# 更改文件权限（让非 root 用户能访问）
RUN chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 暴露端口（
EXPOSE 3000

# 定义启动命令
CMD ["pnpm", "start"]

# ======================== 阶段3：运行MCP Server阶段（runner-mcp）========================
FROM node:22-alpine AS runner-mcp

RUN npm install -g pnpm@7

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 把 mcp-server 放到 /app，这样 WORKDIR /app 下就有 package.json
COPY --from=builder /app/mcp-server/ ./

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 4000

CMD ["pnpm", "run", "server"]