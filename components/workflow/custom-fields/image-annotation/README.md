# 图片标注组件 (Image Annotation Component)

这是一个功能完整的图片标注组件，支持在图片上绘制线条和多边形，并提供丰富的交互功能。

## 功能特性

### 📸 图片输入

- **本地文件上传**：支持选择本地图片或视频文件
- **视频帧提取**：自动提取视频文件的第一帧作为标注图片
- **摄像头快照**：集成摄像头API，直接获取实时画面

### 🎨 绘制工具

- **线条绘制**：点击两点绘制线条
- **多边形绘制**：连续点击多点绘制封闭多边形
- **选择工具**：选择和编辑已绘制的图形

### ✏️ 编辑功能

- **拖拽支持**：支持拖拽顶点和整个图形
- **实时预览**：绘制过程中实时显示预览
- **选择高亮**：选中图形显示虚线边框和控制点

### 🔧 操作控制

- **撤销/重做**：完整的历史记录管理
- **清除功能**：一键清除所有标注
- **键盘快捷键**：
  - `Ctrl/Cmd + Z`: 撤销
  - `Ctrl/Cmd + Shift + Z` 或 `Ctrl/Cmd + Y`: 重做
  - `Ctrl/Cmd + S`: 保存
  - `Esc`: 取消当前绘制
  - `Delete/Backspace`: 删除选中图形

### 💾 数据输出

- **坐标导出**：导出所有标注的像素坐标
- **格式标准**：二维数组格式，便于后续处理

## 使用方法

### 基本用法

```tsx
import ImageAnnotation from '@/components/workflow/custom-fields/image-annotation';

function MyComponent() {
  const handleSubmit = (coordinates: Point[][]) => {
    console.log('标注坐标:', coordinates);
    // 处理标注数据
  };

  return (
    <ImageAnnotation
      onSubmit={handleSubmit}
      workspaceId="your-workspace-id"
      cameraId="your-camera-id"
      defaultMode="select"
    />
  );
}
```

### 高级配置

```tsx
<ImageAnnotation
  onSubmit={handleSubmit}
  workspaceId="workspace-123"
  cameraId="camera-456"
  defaultMode="polygon"
  maxShapes={20}
  allowedFileTypes={['image/jpeg', 'image/png', 'video/mp4']}
  className="custom-annotation-style"
/>
```

## API 参数

### Props

| 参数               | 类型                               | 必填 | 默认值                   | 说明                       |
| ------------------ | ---------------------------------- | ---- | ------------------------ | -------------------------- |
| `onSubmit`         | `(coordinates: Point[][]) => void` | ✅   | -                        | 保存标注时的回调函数       |
| `workspaceId`      | `string`                           | ❌   | -                        | 工作空间ID，用于摄像头快照 |
| `cameraId`         | `string`                           | ❌   | -                        | 摄像头ID，用于获取快照     |
| `defaultMode`      | `'select' \| 'line' \| 'polygon'`  | ❌   | `'select'`               | 默认操作模式               |
| `maxShapes`        | `number`                           | ❌   | `10`                     | 最大标注数量               |
| `allowedFileTypes` | `string[]`                         | ❌   | `['image/*', 'video/*']` | 允许的文件类型             |
| `className`        | `string`                           | ❌   | -                        | 自定义CSS类名              |

### 类型定义

```typescript
interface Point {
  x: number;
  y: number;
}

interface ImageAnnotationProps {
  onSubmit: (coordinates: Point[][]) => void;
  workspaceId?: string;
  cameraId?: string;
  defaultMode?: 'select' | 'line' | 'polygon';
  maxShapes?: number;
  allowedFileTypes?: string[];
  className?: string;
}
```

## 操作指南

### 1. 加载图片

- 点击"选择文件"按钮上传本地图片或视频
- 如果上传视频，组件会自动提取第一帧
- 或者点击"摄像头快照"获取实时画面（需要提供workspaceId和cameraId）

### 2. 绘制线条

1. 选择"画线"模式
2. 点击图片上的第一个点
3. 移动鼠标查看预览线条
4. 点击第二个点完成线条绘制

### 3. 绘制多边形

1. 选择"画多边形"模式
2. 点击图片上的第一个点开始绘制
3. 继续点击添加更多顶点
4. 点击接近第一个点的位置闭合多边形

### 4. 编辑图形

1. 选择"选择"模式
2. 点击图形选中它
3. 拖拽顶点调整形状
4. 拖拽图形整体移动位置

### 5. 保存结果

- 点击"保存标注"按钮
- 或使用快捷键 `Ctrl/Cmd + S`
- 标注坐标将通过 `onSubmit` 回调函数返回

## 组件结构

```
image-annotation/
├── index.tsx          # 主组件
├── toolbar.tsx        # 操作栏组件
├── canvas.tsx         # 画布组件
├── types.ts          # 类型定义
├── utils.ts          # 工具函数
└── README.md         # 使用文档
```

## 注意事项

1. **摄像头功能**：需要提供有效的 `workspaceId` 和 `cameraId`
2. **文件大小**：建议控制上传文件大小，避免影响性能
3. **浏览器兼容**：使用了 Canvas API 和 File API，需要现代浏览器支持
4. **键盘事件**：组件会监听全局键盘事件，可能与其他组件冲突

## 依赖项

- React 18+
- shadcn/ui 组件库
- Tailwind CSS
- lucide-react 图标库

## 示例

完整的使用示例请参考 `example.tsx` 文件。
