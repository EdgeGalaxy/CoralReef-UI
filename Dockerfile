# 第一阶段：安装依赖
FROM node:20-alpine AS deps
WORKDIR /app

# 安装 libc6-compat 用于兼容性
RUN apk add --no-cache libc6-compat

# 只复制 package.json 和 package-lock.json 文件以便更好地利用缓存
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci --ignore-scripts

# 第二阶段：构建应用
FROM node:20-alpine AS builder
WORKDIR /app

# 设置环境变量
ENV NEXT_PUBLIC_API_BASE_URL=https://coral.loopeai.com

# 从 deps 阶段复制 node_modules 以利用缓存
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第三阶段：运行时环境
FROM node:20-alpine AS runner
WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
# NextAuth 所需环境变量
ENV NEXTAUTH_URL=https://coral.loopeai.com
ENV NEXTAUTH_SECRET=abcdvwxHINOPUVWXYZ

# 创建非root用户以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制公共文件
COPY --from=builder /app/public ./public

# 设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非root用户
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 运行应用
CMD ["node", "server.js"]