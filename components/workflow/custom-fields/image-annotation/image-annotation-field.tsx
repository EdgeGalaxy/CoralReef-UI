// 图片标注组件 - 主要导出文件
// 用于 custom-fields 系统集成

'use client';

import React from 'react';
import ImageAnnotation from './index';
import { Point } from './types';

// 为了与其他 custom-fields 组件保持一致性，创建一个包装组件
interface ImageAnnotationFieldProps {
  value?: Point[][];
  onChange?: (value: Point[][]) => void;
  workspaceId?: string;
  cameraId?: string;
  defaultMode?: 'select' | 'line' | 'polygon';
  maxShapes?: number;
  allowedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export function ImageAnnotationField({
  value = [],
  onChange,
  workspaceId,
  cameraId,
  defaultMode = 'select',
  maxShapes = 10,
  allowedFileTypes = ['image/*', 'video/*'],
  className,
  disabled = false
}: ImageAnnotationFieldProps) {
  const handleSubmit = (coordinates: Point[][]) => {
    if (onChange && !disabled) {
      onChange(coordinates);
    }
  };

  if (disabled) {
    return (
      <div
        className={`rounded-lg border-2 border-dashed border-gray-300 p-8 text-center ${className}`}
      >
        <div className="text-gray-500">
          <div className="mb-2 text-lg">图片标注组件已禁用</div>
          <div className="text-sm">
            {value.length > 0
              ? `当前有 ${value.length} 个标注对象`
              : '没有标注数据'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ImageAnnotation
      onSubmit={handleSubmit}
      workspaceId={workspaceId}
      cameraId={cameraId}
      defaultMode={defaultMode}
      maxShapes={maxShapes}
      allowedFileTypes={allowedFileTypes}
      className={className}
    />
  );
}

// 重新导出所有类型和组件
export { default as ImageAnnotation } from './index';
export { Toolbar } from './toolbar';
export { Canvas } from './canvas';
export type {
  Point,
  Shape,
  LineShape,
  PolygonShape,
  DrawingMode,
  DrawingState,
  ImageAnnotationProps,
  ToolbarProps,
  CanvasProps
} from './types';
export * from './utils';

// 默认导出
export default ImageAnnotationField;
