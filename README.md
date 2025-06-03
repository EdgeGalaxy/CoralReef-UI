# CoralReef-UI

## 项目简介

CoralReef-UI 是 CoralReef 平台的前端界面，基于 Next.js 构建的现代化 Web 应用程序。它提供了一个直观、友好的用户界面，用于管理和操作 CoralReef 系统的各种功能，包括工作流管理、模型部署、设备监控等。作为 CoralReef 生态系统的重要组成部分，该 UI 界面使用户能够轻松地与后端服务进行交互，实现复杂的机器学习和部署任务。

## 功能特性

### 用户认证与管理

- 用户登录/注册/注销
- 基于角色的权限管理
- 用户资料管理

### 工作流管理

- 创建、编辑和删除工作流
- 工作流模板管理
- 可视化工作流编辑器
- 工作流执行状态监控

### 部署管理

- 网关管理（CRUD、状态监控、告警）
- 摄像头管理（CRUD、状态监控、告警）
- 服务部署配置
- 部署状态监控

### 模型管理

- ML 模型管理（上传、删除、查看）
- 模型转换工具
- 模型评估功能

### 区块管理

- 可视化区块编辑
- 区块可见性控制
- 区块关联设置
- 区块翻译支持

### 系统监控与告警

- 实时状态监控
- 系统性能指标
- 服务健康检查
- 告警配置与通知

## 安装与部署

### 开发环境

1. 克隆代码库

```bash
git clone https://github.com/yourusername/CoralReef-UI.git
cd CoralReef-UI
```

2. 安装依赖

```bash
npm install
```

3. 更新环境变量

```bash
mv .env.example .env.local

# 填充内部的环境变量值
```

4. 运行开发服务器

```bash
npm run dev
```

4. 访问 `http://localhost:3000` 查看应用

### 生产环境部署

#### 使用 Docker（推荐）

1. 构建 Docker 镜像

```bash
docker build -t coralreef-ui .
```

2. 运行容器

```bash
docker run -p 3000:3000 --env-file .env.local coralreef-ui
```

### 环境变量配置

在生产环境中，请确保设置以下环境变量：

- `NEXT_PUBLIC_API_BASE_URL`: API 服务器的基础 URL
- `NEXTAUTH_URL`: 认证服务器的 URL（通常是你的域名）
- `NEXTAUTH_SECRET`: 用于加密会话的密钥

## 与 CoralReef 系统集成

CoralReef-UI 是 CoralReef 平台的一部分，通常与以下组件配合使用：

- CoralReefBackend: 后端 API 服务
- Coral-Inference: 推理服务框架
