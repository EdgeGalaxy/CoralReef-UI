# 图片标注组件使用指南

## 快速开始

### 1. 基本使用

```tsx
import ImageAnnotationField from '@/components/workflow/custom-fields/image-annotation/image-annotation-field';

function MyForm() {
  const [annotations, setAnnotations] = useState<Point[][]>([]);

  return (
    <ImageAnnotationField
      value={annotations}
      onChange={setAnnotations}
      workspaceId="your-workspace-id"
      cameraId="your-camera-id"
    />
  );
}
```

### 2. 在表单中使用

```tsx
import { useForm } from 'react-hook-form';
import ImageAnnotationField from '@/components/workflow/custom-fields/image-annotation/image-annotation-field';

interface FormData {
  annotations: Point[][];
}

function AnnotationForm() {
  const { register, handleSubmit, setValue, watch } = useForm<FormData>();
  const annotations = watch('annotations');

  const onSubmit = (data: FormData) => {
    console.log('提交的标注数据:', data.annotations);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ImageAnnotationField
        value={annotations}
        onChange={(value) => setValue('annotations', value)}
        defaultMode="polygon"
        maxShapes={5}
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

### 3. 高级配置

```tsx
<ImageAnnotationField
  value={annotations}
  onChange={setAnnotations}
  workspaceId="workspace-123"
  cameraId="camera-456"
  defaultMode="line"
  maxShapes={20}
  allowedFileTypes={['image/jpeg', 'image/png']}
  disabled={false}
  className="custom-style"
/>
```

## 数据格式

标注数据以二维数组形式返回：

```typescript
[
  [
    { x: 100, y: 200 },
    { x: 300, y: 400 }
  ], // 线条
  [
    { x: 50, y: 50 },
    { x: 150, y: 50 },
    { x: 100, y: 150 }
  ] // 多边形
];
```

## 操作说明

1. **上传图片**: 点击"选择文件"按钮
2. **摄像头快照**: 点击"摄像头快照"按钮
3. **绘制线条**: 选择"画线"模式，点击两点
4. **绘制多边形**: 选择"画多边形"模式，连续点击多点
5. **编辑图形**: 选择"选择"模式，拖拽顶点或整个图形
6. **保存**: 点击"保存标注"按钮

## 注意事项

- 需要提供有效的 `workspaceId` 和 `cameraId` 才能使用摄像头功能
- 视频文件会自动提取第一帧作为图片
- 支持撤销/重做功能 (Ctrl/Cmd + Z)
- 可以使用键盘快捷键进行操作
