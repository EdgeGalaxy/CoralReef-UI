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

- `anyof-kind-field.tsx` 中的 `Input` 组件同时绑定了 `onChange` 和 `onBlur` 事件
- 这可能导致数据更新的时机不一致

## 解决方案

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

### 3. 优化表单字段更新逻辑

在 `components/workflow/custom-fields/anyof-kind-field.tsx` 中：

- 移除 `Input` 组件的 `onBlur` 事件处理
- 确保 `onChange` 事件立即触发数据更新

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  setInputValue(newValue);
  // 立即触发 onChange，不等待 blur 事件
  onChange(newValue);
};
```

## 修复后的效果

1. **实时数据同步**：表单字段的更新会立即反映在节点数据中
2. **状态持久化**：折叠/展开高级选项不会导致数据丢失
3. **数据一致性**：关闭并重新打开 NodeDetail 组件时，会显示最新的节点数据

## 注意事项

1. 移除 `React.memo` 可能会带来轻微的性能影响，但在这种场景下，数据的正确性比性能优化更重要
2. 使用 ID 管理选中状态是一种更可靠的模式，避免了引用过时的问题
3. 后续如果需要性能优化，可以考虑使用更细粒度的优化策略，如 `React.useMemo` 或 `React.useCallback`
