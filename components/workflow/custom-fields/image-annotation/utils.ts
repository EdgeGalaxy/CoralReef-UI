import { Point, Shape, LineShape, PolygonShape } from './types';

// 几何计算工具函数
export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isPointNearLine(
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  threshold: number = 5
): boolean {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy) <= threshold;
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].y > point.y !== polygon[j].y > point.y &&
      point.x <
        ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
          (polygon[j].y - polygon[i].y) +
          polygon[i].x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function isPointNearPoint(
  p1: Point,
  p2: Point,
  threshold: number = 8
): boolean {
  return calculateDistance(p1, p2) <= threshold;
}

// 文件处理工具函数
export function extractVideoFrame(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };

    video.onerror = () => {
      reject(new Error('视频加载失败'));
    };

    video.src = URL.createObjectURL(file);
  });
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

// Canvas绘制工具函数
export function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  color: string,
  strokeWidth: number,
  selected: boolean = false
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.setLineDash(selected ? [5, 5] : []);

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // 绘制端点
  if (selected) {
    drawPoint(ctx, start, color, 6);
    drawPoint(ctx, end, color, 6);
  }
}

export function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  strokeWidth: number,
  closed: boolean = false,
  selected: boolean = false
) {
  if (points.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.setLineDash(selected ? [5, 5] : []);

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  if (closed) {
    ctx.closePath();
  }

  ctx.stroke();

  // 绘制顶点
  if (selected) {
    points.forEach((point) => drawPoint(ctx, point, color, 6));
  }
}

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  point: Point,
  color: string,
  radius: number = 4
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制白色边框
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// 形状操作工具函数
export function moveShape(shape: Shape, offset: Point): Shape {
  if (shape.type === 'line') {
    return {
      ...shape,
      points: [
        { x: shape.points[0].x + offset.x, y: shape.points[0].y + offset.y },
        { x: shape.points[1].x + offset.x, y: shape.points[1].y + offset.y }
      ]
    };
  } else {
    return {
      ...shape,
      points: shape.points.map((p) => ({
        x: p.x + offset.x,
        y: p.y + offset.y
      }))
    };
  }
}

export function moveShapePoint(
  shape: Shape,
  pointIndex: number,
  newPoint: Point
): Shape {
  if (shape.type === 'line') {
    const newPoints: [Point, Point] = [...shape.points];
    newPoints[pointIndex] = newPoint;
    return { ...shape, points: newPoints };
  } else {
    const newPoints = [...shape.points];
    newPoints[pointIndex] = newPoint;
    return { ...shape, points: newPoints };
  }
}

export function generateShapeId(): string {
  return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function findShapeAtPoint(
  shapes: Shape[],
  point: Point
): { shape: Shape; type: 'shape' | 'point'; index?: number } | null {
  // 首先检查是否点击在某个形状的顶点上
  for (const shape of shapes) {
    if (shape.type === 'line') {
      for (let i = 0; i < shape.points.length; i++) {
        if (isPointNearPoint(point, shape.points[i])) {
          return { shape, type: 'point', index: i };
        }
      }
    } else {
      for (let i = 0; i < shape.points.length; i++) {
        if (isPointNearPoint(point, shape.points[i])) {
          return { shape, type: 'point', index: i };
        }
      }
    }
  }

  // 然后检查是否点击在形状上
  for (const shape of shapes) {
    if (shape.type === 'line') {
      if (isPointNearLine(point, shape.points[0], shape.points[1])) {
        return { shape, type: 'shape' };
      }
    } else {
      if (shape.closed && isPointInPolygon(point, shape.points)) {
        return { shape, type: 'shape' };
      } else if (!shape.closed) {
        // 检查是否点击在多边形的边上
        for (let i = 0; i < shape.points.length - 1; i++) {
          if (isPointNearLine(point, shape.points[i], shape.points[i + 1])) {
            return { shape, type: 'shape' };
          }
        }
      }
    }
  }

  return null;
}

// 坐标转换工具函数
export function getCanvasCoordinates(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

// 将 canvas 坐标转换为原图坐标
export function convertCanvasToImageCoordinates(
  canvasPoint: Point,
  canvasWidth: number,
  canvasHeight: number,
  imageNaturalWidth: number,
  imageNaturalHeight: number
): Point {
  const scaleX = imageNaturalWidth / canvasWidth;
  const scaleY = imageNaturalHeight / canvasHeight;

  return {
    x: Math.round(canvasPoint.x * scaleX),
    y: Math.round(canvasPoint.y * scaleY)
  };
}

// 将原图坐标转换为 canvas 坐标
export function convertImageToCanvasCoordinates(
  imagePoint: Point,
  canvasWidth: number,
  canvasHeight: number,
  imageNaturalWidth: number,
  imageNaturalHeight: number
): Point {
  const scaleX = canvasWidth / imageNaturalWidth;
  const scaleY = canvasHeight / imageNaturalHeight;

  return {
    x: imagePoint.x * scaleX,
    y: imagePoint.y * scaleY
  };
}

// 数据导出工具函数 - 导出原图坐标
export function exportShapesToCoordinates(
  shapes: Shape[],
  canvasWidth?: number,
  canvasHeight?: number,
  imageNaturalWidth?: number,
  imageNaturalHeight?: number
): Point[][] {
  return shapes.map((shape) => {
    let points: Point[];

    if (shape.type === 'line') {
      points = [shape.points[0], shape.points[1]];
    } else {
      points = shape.points;
    }

    // 如果提供了尺寸信息，转换为原图坐标
    if (
      canvasWidth &&
      canvasHeight &&
      imageNaturalWidth &&
      imageNaturalHeight
    ) {
      return points.map((point) =>
        convertCanvasToImageCoordinates(
          point,
          canvasWidth,
          canvasHeight,
          imageNaturalWidth,
          imageNaturalHeight
        )
      );
    }

    // 否则返回 canvas 坐标
    return points;
  });
}
