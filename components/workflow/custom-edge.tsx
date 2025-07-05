import React, { useState, useEffect } from 'react';
import { getBezierPath, EdgeProps } from 'reactflow';
import { X } from 'lucide-react';
import './custom-edge.css';

interface CustomEdgeProps extends EdgeProps {
  selected?: boolean;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(selected);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // 动态计算边线样式
  const getEdgeStyle = () => {
    let strokeWidth = 2;
    let stroke = '#5a67d8'; // 默认蓝色
    let filter = 'none';

    if (isSelected) {
      strokeWidth = 4;
      stroke = '#ef4444'; // 选中时使用红色，更明显
      filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'; // 添加红色发光效果
    } else if (isHovered) {
      strokeWidth = 3;
      stroke = '#4f46e5'; // 悬停时使用深蓝色
      filter = 'drop-shadow(0 0 4px rgba(79, 70, 229, 0.4))'; // 添加蓝色发光效果
    }

    return {
      fill: 'none',
      stroke,
      strokeWidth,
      filter,
      transition:
        'stroke 0.15s ease-out, stroke-width 0.15s ease-out, filter 0.15s ease-out',
      cursor: 'pointer',
      ...style
    };
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    // 触发删除边线的全局事件
    const deleteEvent = new CustomEvent('delete-edge', {
      detail: { id }
    });
    window.dispatchEvent(deleteEvent);
  };

  const handleEdgeClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSelected(!isSelected);

    // 触发选中事件，通知父组件
    const selectEvent = new CustomEvent('select-edge', {
      detail: { id, selected: !isSelected }
    });
    window.dispatchEvent(selectEvent);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 监听全局键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && isSelected) {
        event.preventDefault();
        handleDelete(event as any);
      }
    };

    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelected, id]);

  // 监听全局取消选中事件
  useEffect(() => {
    const handleDeselectAll = () => {
      setIsSelected(false);
    };

    window.addEventListener('deselect-all-edges', handleDeselectAll);
    return () => {
      window.removeEventListener('deselect-all-edges', handleDeselectAll);
    };
  }, []);

  return (
    <g className="react-flow__edge">
      {/* 增加一个不可见的较宽路径用于提高hover区域 */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
      />

      {/* 实际显示的边线 */}
      <path
        id={id}
        className="react-flow__edge-path-animated"
        d={edgePath}
        markerEnd={markerEnd}
        style={getEdgeStyle()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
      />

      {/* 删除按钮 */}
      <foreignObject
        width={18}
        height={18}
        x={labelX - 9}
        y={labelY - 9}
        className={`edgebutton-wrapper ${
          isHovered || isSelected ? 'visible' : ''
        }`}
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <button className="edgebutton" onClick={handleDelete} title="删除连接">
          <X size={10} />
        </button>
      </foreignObject>
    </g>
  );
};

export default CustomEdge;
