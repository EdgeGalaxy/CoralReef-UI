# 使用 Node.js 官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=development
ENV NEXTAUTH_URL=http://localhost:3000
ENV AUTH_SECRET=abcdvwxHINOPUVWXYZ
ENV NEXTAUTH_SECRET=abcdvwxHINOPUVWXYZ

# 启动开发服务器
CMD ["npm", "run", "dev"]
