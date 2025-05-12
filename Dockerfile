FROM node:20-alpine AS deps
WORKDIR /app

# 只复制 package.json 和 package-lock.json 文件以便更好地利用缓存
COPY package*.json ./
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app

# 设置环境变量
ENV NEXT_PUBLIC_API_BASE_URL=https://coral.loopeai.com

# 从deps阶段复制node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建应用
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
# NextAuth 所需环境变量
ENV NEXTAUTH_URL=https://coral.loopeai.com
ENV NEXTAUTH_SECRET=abcdvwxHINOPUVWXYZ

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

EXPOSE 3000

# 运行应用
CMD ["node", "server.js"]