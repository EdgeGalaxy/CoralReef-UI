# Workflow 输入字段性能优化方案

## 问题背景

最初移除 `onBlur` 事件后，每次按键都会触发 `onChange`，可能导致：

- 输入卡顿
- 频繁的表单重新渲染
- 性能下降

## 优化方案：防抖 + Blur 混合策略

### 实现原理

1. **防抖（Debounce）**

   - 延迟 300ms 触发更新
   - 用户连续输入时只触发一次更新
   - 适合快速输入场景

2. **Blur 事件**

   - 用户完成输入并移开焦点时立即更新
   - 确保数据及时保存
   - 适合用户输入后立即操作其他元素的场景

3. **协同机制**
   - 使用 `hasBlurred` 标志避免重复更新
   - 如果通过 blur 已更新，防抖不再触发
   - 确保数据一致性

### 代码实现

```typescript
// 防抖 Hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 使用防抖值
const debouncedInputValue = useDebounce(inputValue, 300);

// 防抖更新逻辑
useEffect(() => {
  if (debouncedInputValue !== formData && !isKindMode && !hasBlurred) {
    onChange(debouncedInputValue);
  }
  setHasBlurred(false);
}, [debouncedInputValue, formData, onChange, isKindMode, hasBlurred]);
```

## 优势

1. **性能优化**：减少频繁的表单更新
2. **用户体验**：输入流畅，不会卡顿
3. **数据安全**：确保数据不会丢失
4. **灵活性**：适应不同的用户操作习惯

## 可调参数

- **防抖延迟**：当前设置为 300ms，可根据实际需求调整
  - 更短的延迟（如 150ms）：更快的响应，但可能增加更新频率
  - 更长的延迟（如 500ms）：更少的更新，但可能感觉响应较慢

## 使用建议

1. 对于需要实时验证的字段，可以考虑更短的防抖延迟
2. 对于复杂计算的字段，可以考虑更长的防抖延迟
3. 如果表单较简单，可以考虑只使用 onBlur 策略
