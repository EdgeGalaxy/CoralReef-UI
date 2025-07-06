# 第一阶段：安装依赖
FROM node:20-alpine
WORKDIR /app

# 安装 libc6-compat 用于兼容性
RUN apk add --no-cache libc6-compat

# 只复制 package.json 和 package-lock.json 文件以便更好地利用缓存
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci --ignore-scripts

# 设置环境变量
ENV NEXT_PUBLIC_API_BASE_URL=https://coral.loopeai.com

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 设置生产环境
ENV NODE_ENV=production
# NextAuth 所需环境变量
ENV NEXTAUTH_URL=https://coral.loopeai.com
ENV NEXTAUTH_SECRET=abcdvwxHINOPUVWXYZ

EXPOSE 3000

# 运行应用
CMD ["node", "server.js"]