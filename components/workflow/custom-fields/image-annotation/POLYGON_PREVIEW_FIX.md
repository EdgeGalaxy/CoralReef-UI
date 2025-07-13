# 多边形预览线修复文档

## 问题描述

在多边形绘制模式下，当用户点击第一次鼠标后，鼠标移动时会产生很多点组成的线，而不是一条从第一个点到当前鼠标位置的直线预览。

### 原始问题

- 每次鼠标移动都会向 `currentShape.points` 数组添加新点
- 导致预览显示为多点连线而非直线
- 用户体验不佳，预览效果混乱

## 解决方案

### 核心思路

分离**确定的顶点**和**预览点**：

- `currentShape.points[]` 只存储用户确定点击的顶点
- `previewPoint` 存储当前鼠标位置，用于绘制预览线
- 绘制时：绘制所有确定的边 + 一条预览虚线

### 技术实现

#### 1. 类型定义修改

```typescript
// types.ts
export interface DrawingState {
  // ... 其他字段
  previewPoint: Point | null; // 新增：用于多边形绘制时的预览点
}

export interface CanvasProps {
  // ... 其他字段
  previewPoint: Point | null; // 新增：传递给Canvas组件
}
```

#### 2. 状态管理修改

```typescript
// 初始化状态
const [drawingState, setDrawingState] = useState<DrawingState>({
  // ... 其他字段
  previewPoint: null // 新增
});
```

#### 3. 鼠标移动逻辑修改

**修改前**：

```typescript
// 错误：每次移动都添加点到数组
} else if (drawingState.currentShape.type === 'polygon') {
  const updatedPolygon = {
    ...drawingState.currentShape,
    points: [...drawingState.currentShape.points, point] // ❌ 问题所在
  };
  setDrawingState(prev => ({ ...prev, currentShape: updatedPolygon }));
}
```

**修改后**：

```typescript
// 正确：只更新预览点
} else if (drawingState.currentShape.type === 'polygon') {
  setDrawingState(prev => ({
    ...prev,
    previewPoint: point // ✅ 只更新预览点
  }));
}
```

#### 4. Canvas绘制逻辑修改

**修改前**：

```typescript
// 复杂且容易出错的逻辑
const actualPoints =
  isDrawing && currentShape.points.length > 1
    ? currentShape.points.slice(0, -1)
    : currentShape.points;
```

**修改后**：

```typescript
// 简洁清晰的逻辑
// 绘制多边形的所有确定顶点
if (currentShape.points.length > 1) {
  drawPolygon(
    ctx,
    currentShape.points,
    currentShape.color,
    currentShape.strokeWidth,
    currentShape.closed,
    isSelected
  );
}

// 绘制预览线（从最后一个确定顶点到预览点）
if (isDrawing && previewPoint && currentShape.points.length > 0) {
  const lastPoint = currentShape.points[currentShape.points.length - 1];
  // 使用虚线绘制预览线
  ctx.setLineDash([5, 5]);
  drawLine(ctx, lastPoint, previewPoint, currentShape.color, 1, false);
  ctx.setLineDash([]); // 重置为实线
}
```

## 修改文件清单

### 1. 类型定义文件

- `types.ts`: 添加 `previewPoint` 字段到相关接口

### 2. 主组件文件

- `index.tsx`:
  - 状态初始化添加 `previewPoint: null`
  - 修改鼠标移动逻辑
  - 所有状态重置处添加 `previewPoint: null`
  - 传递 `previewPoint` 给Canvas组件

### 3. Canvas组件文件

- `canvas.tsx`:
  - 接收 `previewPoint` 参数
  - 修改多边形绘制逻辑
  - 使用虚线绘制预览线

## 修复效果

### 修复前

- ❌ 鼠标移动时显示多点连线
- ❌ 预览效果混乱
- ❌ 用户难以预判最终形状

### 修复后

- ✅ 鼠标移动时显示单条虚线
- ✅ 预览线从最后确定点到当前鼠标位置
- ✅ 用户可以清晰预判下一条边的位置
- ✅ 更符合用户对多边形绘制的直觉期望

## 测试验证

- ✅ TypeScript 编译通过
- ✅ Next.js 构建成功
- ✅ 没有引入新的bug
- ✅ 保持了原有的其他功能

## 代码质量改进

1. **更清晰的状态分离**：确定点 vs 预览点
2. **更简洁的绘制逻辑**：减少了复杂的数组操作
3. **更好的用户体验**：虚线预览更直观
4. **更强的类型安全**：新增字段有完整的类型定义

## 后续优化建议

1. **视觉优化**：可以调整虚线样式（长度、间隔、颜色）
2. **交互优化**：可以添加鼠标悬停时的视觉反馈
3. **性能优化**：可以考虑防抖处理频繁的鼠标移动事件

## 兼容性

- ✅ 向后兼容：不影响现有的线条绘制功能
- ✅ 不破坏性：保持了原有的API接口
- ✅ 扩展性：为后续添加新的绘制类型提供了良好的基础
