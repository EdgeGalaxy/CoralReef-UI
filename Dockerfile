FROM node:20-alpine AS builder
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --ignore-scripts

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
# NextAuth 所需环境变量
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=your-nextauth-secret

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

EXPOSE 3000

# 运行应用
CMD ["node", "server.js"]