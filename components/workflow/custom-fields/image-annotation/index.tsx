'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

import { Toolbar } from './toolbar';
import { Canvas } from './canvas';
import {
  ImageAnnotationProps,
  DrawingState,
  Shape,
  LineShape,
  PolygonShape,
  Point,
  DrawingMode
} from './types';
import {
  generateShapeId,
  getCanvasCoordinates,
  findShapeAtPoint,
  moveShape,
  moveShapePoint,
  exportShapesToCoordinates,
  isPointNearPoint
} from './utils';

export function ImageAnnotation({
  onSubmit,
  workspaceId,
  cameraId,
  defaultMode = 'select',
  maxShapes = 10,
  allowedFileTypes = ['image/*', 'video/*'],
  className
}: ImageAnnotationProps) {
  const { toast } = useToast();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    mode: defaultMode,
    isDrawing: false,
    currentShape: null,
    shapes: [],
    selectedShapeId: null,
    previewPoint: null,
    dragState: {
      isDragging: false,
      dragType: null,
      dragIndex: undefined,
      startPoint: null,
      offset: null
    }
  });

  // 添加尺寸状态用于坐标转换
  const [canvasDimensions, setCanvasDimensions] = useState<{
    canvasWidth: number;
    canvasHeight: number;
    imageNaturalWidth: number;
    imageNaturalHeight: number;
  } | null>(null);

  // 撤销/重做历史记录
  const [history, setHistory] = useState<Shape[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);

  // 保存历史记录
  const saveToHistory = useCallback(
    (shapes: Shape[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push([...shapes]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // 处理模式变化
  const handleModeChange = useCallback((mode: DrawingMode) => {
    setDrawingState((prev) => ({
      ...prev,
      mode,
      isDrawing: false,
      currentShape: null,
      selectedShapeId: null,
      previewPoint: null,
      dragState: {
        isDragging: false,
        dragType: null,
        dragIndex: undefined,
        startPoint: null,
        offset: null
      }
    }));
  }, []);

  // 处理图片上传
  const handleImageUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    // 清空所有绘制内容
    setDrawingState((prev) => ({
      ...prev,
      shapes: [],
      currentShape: null,
      selectedShapeId: null,
      isDrawing: false,
      previewPoint: null,
      dragState: {
        isDragging: false,
        dragType: null,
        dragIndex: undefined,
        startPoint: null,
        offset: null
      }
    }));

    // 清空历史记录
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // 处理摄像头快照
  const handleCameraSnapshot = useCallback(() => {
    // 快照处理逻辑在 toolbar 中完成
  }, []);

  // 处理鼠标按下
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const point = getCanvasCoordinates(canvas, e.clientX, e.clientY);

      if (drawingState.mode === 'select') {
        // 选择模式
        const hitResult = findShapeAtPoint(drawingState.shapes, point);

        if (hitResult) {
          setDrawingState((prev) => ({
            ...prev,
            selectedShapeId: hitResult.shape.id,
            dragState: {
              isDragging: true,
              dragType: hitResult.type,
              dragIndex: hitResult.index,
              startPoint: point,
              offset:
                hitResult.type === 'shape'
                  ? {
                      x:
                        point.x -
                        (hitResult.shape.type === 'line'
                          ? hitResult.shape.points[0].x
                          : hitResult.shape.points[0].x),
                      y:
                        point.y -
                        (hitResult.shape.type === 'line'
                          ? hitResult.shape.points[0].y
                          : hitResult.shape.points[0].y)
                    }
                  : null
            }
          }));
        } else {
          // 点击空白处，取消选择
          setDrawingState((prev) => ({
            ...prev,
            selectedShapeId: null,
            dragState: {
              isDragging: false,
              dragType: null,
              dragIndex: undefined,
              startPoint: null,
              offset: null
            }
          }));
        }
      } else if (drawingState.mode === 'line') {
        // 线条绘制模式
        if (!drawingState.isDrawing) {
          // 开始绘制线条
          const newLine: LineShape = {
            id: generateShapeId(),
            type: 'line',
            points: [point, point],
            selected: false,
            color: '#3b82f6',
            strokeWidth: 2
          };

          setDrawingState((prev) => ({
            ...prev,
            isDrawing: true,
            currentShape: newLine,
            selectedShapeId: newLine.id
          }));
        } else {
          // 完成线条绘制
          if (
            drawingState.currentShape &&
            drawingState.currentShape.type === 'line'
          ) {
            const updatedLine = {
              ...drawingState.currentShape,
              points: [drawingState.currentShape.points[0], point] as [
                Point,
                Point
              ]
            };

            const newShapes = [...drawingState.shapes, updatedLine];
            saveToHistory(newShapes);

            setDrawingState((prev) => ({
              ...prev,
              isDrawing: false,
              currentShape: null,
              shapes: newShapes,
              selectedShapeId: null,
              previewPoint: null
            }));
          }
        }
      } else if (drawingState.mode === 'polygon') {
        // 多边形绘制模式
        if (!drawingState.isDrawing) {
          // 开始绘制多边形
          const newPolygon: PolygonShape = {
            id: generateShapeId(),
            type: 'polygon',
            points: [point],
            selected: false,
            color: '#3b82f6',
            strokeWidth: 2,
            closed: false
          };

          setDrawingState((prev) => ({
            ...prev,
            isDrawing: true,
            currentShape: newPolygon,
            selectedShapeId: newPolygon.id
          }));
        } else {
          // 添加多边形顶点
          if (
            drawingState.currentShape &&
            drawingState.currentShape.type === 'polygon'
          ) {
            const firstPoint = drawingState.currentShape.points[0];
            const isClosing = isPointNearPoint(point, firstPoint, 10);

            if (isClosing && drawingState.currentShape.points.length >= 3) {
              // 闭合多边形
              const closedPolygon = {
                ...drawingState.currentShape,
                closed: true
              };

              const newShapes = [...drawingState.shapes, closedPolygon];
              saveToHistory(newShapes);

              setDrawingState((prev) => ({
                ...prev,
                isDrawing: false,
                currentShape: null,
                shapes: newShapes,
                selectedShapeId: null,
                previewPoint: null
              }));
            } else {
              // 添加新顶点
              const updatedPolygon = {
                ...drawingState.currentShape,
                points: [...drawingState.currentShape.points, point]
              };

              setDrawingState((prev) => ({
                ...prev,
                currentShape: updatedPolygon
              }));
            }
          }
        }
      }
    },
    [drawingState, saveToHistory]
  );

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const point = getCanvasCoordinates(canvas, e.clientX, e.clientY);
      setCurrentMousePos(point);

      if (drawingState.mode === 'select' && drawingState.dragState.isDragging) {
        // 拖拽模式
        const { dragType, dragIndex, startPoint, offset } =
          drawingState.dragState;
        const selectedShape = drawingState.shapes.find(
          (s) => s.id === drawingState.selectedShapeId
        );

        if (selectedShape && startPoint) {
          const newShapes = [...drawingState.shapes];
          const shapeIndex = newShapes.findIndex(
            (s) => s.id === selectedShape.id
          );

          if (dragType === 'point' && dragIndex !== undefined) {
            // 拖拽顶点
            newShapes[shapeIndex] = moveShapePoint(
              selectedShape,
              dragIndex,
              point
            );
          } else if (dragType === 'shape' && offset) {
            // 拖拽整个形状
            const moveOffset = {
              x: point.x - startPoint.x,
              y: point.y - startPoint.y
            };
            newShapes[shapeIndex] = moveShape(selectedShape, moveOffset);
          }

          setDrawingState((prev) => ({
            ...prev,
            shapes: newShapes
          }));
        }
      } else if (drawingState.isDrawing && drawingState.currentShape) {
        // 绘制模式下的实时预览
        if (drawingState.currentShape.type === 'line') {
          const updatedLine = {
            ...drawingState.currentShape,
            points: [drawingState.currentShape.points[0], point] as [
              Point,
              Point
            ]
          };

          setDrawingState((prev) => ({
            ...prev,
            currentShape: updatedLine
          }));
        } else if (drawingState.currentShape.type === 'polygon') {
          // 多边形绘制时只更新预览点，不修改确定的顶点数组
          setDrawingState((prev) => ({
            ...prev,
            previewPoint: point
          }));
        }
      }
    },
    [drawingState]
  );

  // 处理鼠标抬起
  const handleMouseUp = useCallback(() => {
    if (drawingState.mode === 'select' && drawingState.dragState.isDragging) {
      // 完成拖拽，保存到历史记录
      saveToHistory(drawingState.shapes);

      setDrawingState((prev) => ({
        ...prev,
        dragState: {
          isDragging: false,
          dragType: null,
          dragIndex: undefined,
          startPoint: null,
          offset: null
        }
      }));
    }
  }, [
    drawingState.mode,
    drawingState.dragState.isDragging,
    drawingState.shapes,
    saveToHistory
  ]);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setCurrentMousePos(null);

    // 重置预览点
    setDrawingState((prev) => ({
      ...prev,
      previewPoint: null
    }));

    if (drawingState.mode === 'select' && drawingState.dragState.isDragging) {
      handleMouseUp();
    }
  }, [drawingState.mode, drawingState.dragState.isDragging, handleMouseUp]);

  // 清除所有
  const handleClear = useCallback(() => {
    if (drawingState.shapes.length > 0) {
      saveToHistory([]);
      setDrawingState((prev) => ({
        ...prev,
        shapes: [],
        currentShape: null,
        selectedShapeId: null,
        isDrawing: false,
        dragState: {
          isDragging: false,
          dragType: null,
          dragIndex: undefined,
          startPoint: null,
          offset: null
        }
      }));
    }
  }, [drawingState.shapes.length, saveToHistory]);

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const shapes = history[newIndex];
      setHistoryIndex(newIndex);
      setDrawingState((prev) => ({
        ...prev,
        shapes,
        currentShape: null,
        selectedShapeId: null,
        isDrawing: false,
        previewPoint: null,
        dragState: {
          isDragging: false,
          dragType: null,
          dragIndex: undefined,
          startPoint: null,
          offset: null
        }
      }));
    }
  }, [history, historyIndex]);

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const shapes = history[newIndex];
      setHistoryIndex(newIndex);
      setDrawingState((prev) => ({
        ...prev,
        shapes,
        currentShape: null,
        selectedShapeId: null,
        isDrawing: false,
        previewPoint: null,
        dragState: {
          isDragging: false,
          dragType: null,
          dragIndex: undefined,
          startPoint: null,
          offset: null
        }
      }));
    }
  }, [history, historyIndex]);

  // 保存标注结果
  const handleSave = useCallback(() => {
    if (drawingState.shapes.length === 0) {
      toast({
        title: '没有标注内容',
        description: '请先绘制一些标注内容再保存',
        variant: 'destructive'
      });
      return;
    }

    // 使用坐标转换导出原图坐标
    const coordinates = canvasDimensions
      ? exportShapesToCoordinates(
          drawingState.shapes,
          canvasDimensions.canvasWidth,
          canvasDimensions.canvasHeight,
          canvasDimensions.imageNaturalWidth,
          canvasDimensions.imageNaturalHeight
        )
      : exportShapesToCoordinates(drawingState.shapes);

    onSubmit(coordinates);

    toast({
      title: '标注已保存',
      description: canvasDimensions
        ? `已保存 ${drawingState.shapes.length} 个标注对象（原图坐标）`
        : `已保存 ${drawingState.shapes.length} 个标注对象（Canvas坐标）`
    });
  }, [drawingState.shapes, canvasDimensions, onSubmit, toast]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }

      switch (e.key) {
        case 'Escape':
          if (drawingState.isDrawing) {
            setDrawingState((prev) => ({
              ...prev,
              isDrawing: false,
              currentShape: null,
              selectedShapeId: null,
              previewPoint: null
            }));
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (drawingState.selectedShapeId) {
            const newShapes = drawingState.shapes.filter(
              (s) => s.id !== drawingState.selectedShapeId
            );
            saveToHistory(newShapes);
            setDrawingState((prev) => ({
              ...prev,
              shapes: newShapes,
              selectedShapeId: null
            }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingState, handleUndo, handleRedo, handleSave, saveToHistory]);

  return (
    <div className={`flex h-[600px] gap-4 ${className}`}>
      <Toolbar
        mode={drawingState.mode}
        onModeChange={handleModeChange}
        onImageUpload={handleImageUpload}
        onCameraSnapshot={handleCameraSnapshot}
        onClear={handleClear}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        workspaceId={workspaceId}
        cameraId={cameraId}
      />

      <div className="flex flex-1 flex-col gap-4">
        <Canvas
          imageSrc={imageSrc}
          shapes={drawingState.shapes}
          mode={drawingState.mode}
          isDrawing={drawingState.isDrawing}
          currentShape={drawingState.currentShape}
          selectedShapeId={drawingState.selectedShapeId}
          previewPoint={drawingState.previewPoint}
          dragState={drawingState.dragState}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDimensionsChange={setCanvasDimensions}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {drawingState.shapes.length > 0 && (
              <span>已标注 {drawingState.shapes.length} 个对象</span>
            )}
            {drawingState.selectedShapeId && (
              <span className="ml-2">• 已选中</span>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={drawingState.shapes.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            保存标注
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ImageAnnotation;
