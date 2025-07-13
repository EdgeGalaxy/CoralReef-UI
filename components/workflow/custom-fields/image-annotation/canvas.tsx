'use client';

import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CanvasProps, Point, Shape } from './types';
import {
  drawLine,
  drawPolygon,
  drawPoint,
  getCanvasCoordinates
} from './utils';

export function Canvas({
  imageSrc,
  shapes,
  mode,
  isDrawing,
  currentShape,
  selectedShapeId,
  previewPoint,
  dragState,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onDimensionsChange,
  className
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 绘制画布内容
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;

    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景图片
    if (image && imageSrc) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    // 绘制所有完成的shapes
    shapes.forEach((shape) => {
      const isSelected = shape.id === selectedShapeId;

      if (shape.type === 'line') {
        drawLine(
          ctx,
          shape.points[0],
          shape.points[1],
          shape.color,
          shape.strokeWidth,
          isSelected
        );
      } else if (shape.type === 'polygon') {
        drawPolygon(
          ctx,
          shape.points,
          shape.color,
          shape.strokeWidth,
          shape.closed,
          isSelected
        );
      }
    });

    // 绘制当前正在绘制的shape
    if (currentShape) {
      const isSelected = currentShape.id === selectedShapeId;

      if (currentShape.type === 'line') {
        drawLine(
          ctx,
          currentShape.points[0],
          currentShape.points[1],
          currentShape.color,
          currentShape.strokeWidth,
          isSelected
        );
      } else if (currentShape.type === 'polygon') {
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
      }
    }
  }, [
    imageSrc,
    shapes,
    currentShape,
    selectedShapeId,
    isDrawing,
    previewPoint
  ]);

  // 当图片加载完成时调整canvas大小
  const handleImageLoad = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const container = containerRef.current;

    if (!canvas || !image || !container) return;

    // 获取容器尺寸
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 计算适应容器的图片尺寸
    const imageAspectRatio = image.naturalWidth / image.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let canvasWidth: number;
    let canvasHeight: number;

    if (imageAspectRatio > containerAspectRatio) {
      // 图片更宽，以宽度为准
      canvasWidth = containerWidth;
      canvasHeight = containerWidth / imageAspectRatio;
    } else {
      // 图片更高，以高度为准
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * imageAspectRatio;
    }

    // 设置canvas尺寸
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 通知父组件尺寸信息
    if (onDimensionsChange) {
      onDimensionsChange({
        canvasWidth,
        canvasHeight,
        imageNaturalWidth: image.naturalWidth,
        imageNaturalHeight: image.naturalHeight
      });
    }

    // 重新绘制
    drawCanvas();
  }, [drawCanvas, onDimensionsChange]);

  // 图片加载
  useEffect(() => {
    const image = imageRef.current;
    if (!image || !imageSrc) return;

    image.onload = handleImageLoad;
    image.src = imageSrc;

    return () => {
      image.onload = null;
    };
  }, [imageSrc, handleImageLoad]);

  // 重绘画布
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 窗口大小改变时重新调整canvas
  useEffect(() => {
    const handleResize = () => {
      handleImageLoad();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleImageLoad]);

  // 鼠标事件处理
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      onMouseDown(e);
    },
    [onMouseDown]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      onMouseMove(e);
    },
    [onMouseMove]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      onMouseUp(e);
    },
    [onMouseUp]
  );

  const handleMouseLeave = useCallback(() => {
    onMouseLeave();
  }, [onMouseLeave]);

  // 获取光标样式
  const getCursorStyle = () => {
    if (mode === 'line' || mode === 'polygon') {
      return 'crosshair';
    }
    if (dragState.isDragging) {
      return dragState.dragType === 'point' ? 'grabbing' : 'move';
    }
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50',
        className
      )}
    >
      {!imageSrc ? (
        <div className="text-center text-gray-500">
          <div className="mb-2 text-lg">请选择图片</div>
          <div className="text-sm">
            支持上传图片或视频文件，也可以获取摄像头快照
          </div>
        </div>
      ) : (
        <>
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Annotation target"
            className="hidden"
          />
          <canvas
            ref={canvasRef}
            className="max-h-full max-w-full"
            style={{ cursor: getCursorStyle() }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />
        </>
      )}

      {/* 绘制模式提示 */}
      {imageSrc && mode !== 'select' && (
        <div className="absolute right-4 top-4 rounded bg-black bg-opacity-75 px-3 py-1 text-sm text-white">
          {mode === 'line' && '点击两点绘制线条'}
          {mode === 'polygon' && '点击多点绘制多边形'}
        </div>
      )}

      {/* 绘制状态提示 */}
      {isDrawing && (
        <div className="absolute bottom-4 right-4 rounded bg-blue-500 px-3 py-1 text-sm text-white">
          正在绘制...
        </div>
      )}
    </div>
  );
}
