# WebRTC 预览组件重构

## 概述

原有的 `webrtc-preview.tsx` 组件已经重构为一个通用的 WebRTC 预览组件架构，支持 deployment 和 camera 两种不同的使用场景。

## 架构设计

### 1. 基础组件 (`base-webrtc-preview.tsx`)

- 包含所有核心的 WebRTC 连接逻辑
- 处理视频流的播放和控制
- 管理连接状态和错误处理
- 通过配置对象适配不同的 API 接口

### 2. 类型定义 (`types/webrtc.ts`)

- `WebRTCConfig`: 定义了 WebRTC 配置接口
- `WebRTCConnectionParams`: 通用连接参数
- `WebRTCResponse`: 统一的响应格式
- `OutputOption`: 输出选项配置
- `BaseWebRTCProps`: 基础组件属性

### 3. 具体实现组件

#### DeploymentPreview (`deployment-preview.tsx`)

- 适配 deployment 的 WebRTC 接口
- 支持多种输出图像选择（原始视频流 + 工作流输出字段）
- API 端点: `/api/reef/workspaces/{workspace_id}/deployments/{deployment_id}/offer`

#### CameraPreview (`camera-preview.tsx`)

- 适配 camera 的 WebRTC 接口
- 仅支持原始视频流
- API 端点: `/api/reef/workspaces/{workspace_id}/cameras/{camera_id}/webrtc-stream`

## 使用方法

### 1. 在 Deployment 场景中使用

```tsx
import DeploymentPreview from './components/deployment-preview';

function DeploymentSidebar({
  deployment
}: {
  deployment: DeploymentDataModel;
}) {
  return (
    <div>
      <DeploymentPreview
        deployment={deployment}
        onStreamStart={() => console.log('Stream started')}
        onStreamStop={() => console.log('Stream stopped')}
        onError={(error) => console.error('Stream error:', error)}
      />
    </div>
  );
}
```

### 2. 在 Camera 场景中使用

```tsx
import CameraPreview from './components/camera-preview';

function CameraSidebar({ camera }: { camera: CameraModel }) {
  return (
    <div>
      <CameraPreview
        camera={camera}
        onStreamStart={() => console.log('Camera stream started')}
        onStreamStop={() => console.log('Camera stream stopped')}
        onError={(error) => console.error('Camera stream error:', error)}
      />
    </div>
  );
}
```

## 主要特性

### 1. 统一的 WebRTC 连接管理

- 自动处理 ICE 服务器配置
- 管理 PeerConnection 生命周期
- 统一的错误处理和重连机制

### 2. 灵活的配置系统

- 通过 `WebRTCConfig` 对象定制不同的 API 接口
- 支持自定义请求参数构建和响应处理
- 可配置的输出选项

### 3. 响应式设计

- 移动端友好的视频播放器
- 自适应的控制按钮布局
- 支持触摸交互

### 4. 状态管理

- 完整的加载、播放、错误状态管理
- 实时的连接状态反馈
- 优雅的错误恢复机制

## API 差异

### Deployment API

```json
{
  "webrtc_offer": { "type": "offer", "sdp": "..." },
  "stream_output": ["detection_result"],
  "webcam_fps": 30,
  "processing_timeout": 1.0,
  "max_consecutive_timeouts": 10,
  "min_consecutive_on_time": 3,
  "fps_probe_frames": 30
}
```

### Camera API

```json
{
  "webrtc_offer": { "type": "offer", "sdp": "..." },
  "fps": 30,
  "processing_timeout": 0.1,
  "max_consecutive_timeouts": 30,
  "min_consecutive_on_time": 5
}
```

## 扩展性

如果需要支持新的 WebRTC 场景，只需要：

1. 创建新的配置对象，实现 `WebRTCConfig` 接口
2. 定义特定的请求参数构建函数
3. 实现响应处理函数
4. 创建新的组件包装 `BaseWebRTCPreview`

## 迁移指南

### 从原有 `webrtc-preview.tsx` 迁移

1. 替换导入:

```tsx
// 原来
import WebRTCPreview from './components/webrtc-preview';

// 现在
import DeploymentPreview from './components/deployment-preview';
```

2. 更新使用方式:

```tsx
// 原来
<WebRTCPreview deployment={deployment} />

// 现在
<DeploymentPreview deployment={deployment} />
```

属性接口保持兼容，无需其他更改。
