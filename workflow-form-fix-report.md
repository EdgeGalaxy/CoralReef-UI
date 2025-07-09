# Workflow 表单数据更新问题修复报告

## 问题描述

1. **表单字段更新未接收**：在 `any-of-kind-field.tsx` 中更新表单字段值后，`node-detail.tsx` 组件没有接收到对应的字段更新
2. **折叠高级选项时字段值重置**：当折叠高级选项时，填写的字段值会被重置为默认值
3. **关闭重开时字段值重置**：关闭 `node-detail.tsx` 组件重新打开时，节点的字段值信息会被重置

## 问题原因分析

### 1. `selectedNode` 引用过时问题

- 在 `app/dashboard/workflow/[workflowId]/page.tsx` 中，`selectedNode` 使用的是直接的对象引用
- 当表单数据更新时，虽然 `nodes` 数组中的数据被正确更新了，但 `selectedNode` 仍然持有旧的引用
- 这导致 `NodeDetail` 组件接收到的 `nodeData` prop 是过时的数据

### 2. React.memo 缓存问题

- `NodeDetail` 组件使用了 `React.memo` 进行性能优化
- 由于 `nodeData` prop 的引用没有变化（仍是旧的 `selectedNode.data`），组件不会重新渲染
- 即使表单内部状态更新了，但由于组件没有重新渲染，无法反映最新的数据

### 3. 表单数据同步延迟

- 最初移除 `onBlur` 事件后，每次按键都会触发 `onChange`
- 这可能导致输入卡顿和频繁的表单重新渲染

## 解决方案（已实施）

### 1. 使用 ID 而非直接引用管理选中节点

在 `app/dashboard/workflow/[workflowId]/page.tsx` 中：

- 将 `selectedNode` 状态改为 `selectedNodeId`
- 使用 `useMemo` 计算当前选中的节点，确保始终获取最新数据

```typescript
const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

const selectedNode = useMemo(() => {
  if (!selectedNodeId) return null;
  return nodes.find((node) => node.id === selectedNodeId) || null;
}, [selectedNodeId, nodes]);
```

### 2. 移除 React.memo 优化

在 `components/workflow/node-detail.tsx` 中：

- 移除 `React.memo` 包装，确保组件能正确响应数据变化
- 这样当 `nodeData` prop 更新时，组件会重新渲染

### 3. 采用纯 Blur 策略（最终方案）

在 `components/workflow/custom-fields/anyof-kind-field.tsx` 中：

- 使用纯 `onBlur` 策略，避免输入卡顿
- 只在用户完成输入并移开焦点时才触发数据更新
- Select 组件仍然立即触发，因为是明确的用户选择操作

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  setInputValue(newValue);
  // 不立即触发 onChange，等待 blur 事件
};

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  // 只有值真正改变时才触发 onChange
  if (newValue !== formData) {
    onChange(newValue);
  }
};
```

## 修复后的效果

1. **实时数据同步**：表单字段的更新会在失去焦点时立即生效
2. **状态持久化**：折叠/展开高级选项不会导致数据丢失
3. **数据一致性**：关闭并重新打开 NodeDetail 组件时，会显示最新的节点数据
4. **输入流畅性**：输入时不会有任何卡顿，体验流畅

## 注意事项

1. **数据保存时机**：用户需要切换焦点（点击其他字段或按 Tab 键）才能保存输入的数据
2. **用户习惯**：这符合大多数表单的使用习惯，用户通常在完成输入后会自然地切换到下一个字段
3. **Select 组件**：下拉选择仍然是立即生效的，因为这是明确的用户选择操作
