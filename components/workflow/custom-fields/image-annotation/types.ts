export interface Point {
  x: number;
  y: number;
}

export interface LineShape {
  id: string;
  type: 'line';
  points: [Point, Point];
  selected: boolean;
  color: string;
  strokeWidth: number;
}

export interface PolygonShape {
  id: string;
  type: 'polygon';
  points: Point[];
  selected: boolean;
  color: string;
  strokeWidth: number;
  closed: boolean;
}

export type Shape = LineShape | PolygonShape;

export type DrawingMode = 'line' | 'polygon' | 'select';

export interface DrawingState {
  mode: DrawingMode;
  isDrawing: boolean;
  currentShape: Shape | null;
  shapes: Shape[];
  selectedShapeId: string | null;
  previewPoint: Point | null; // 用于多边形绘制时的预览点
  dragState: {
    isDragging: boolean;
    dragType: 'shape' | 'point' | null;
    dragIndex?: number;
    startPoint: Point | null;
    offset: Point | null;
  };
}

export interface ImageAnnotationProps {
  onSubmit: (coordinates: Point[][]) => void;
  workspaceId?: string;
  cameraId?: string;
  defaultMode?: DrawingMode;
  maxShapes?: number;
  allowedFileTypes?: string[];
  className?: string;
}

export interface ToolbarProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  onImageUpload: (file: File) => void;
  onCameraSnapshot: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  workspaceId?: string;
  cameraId?: string;
}

export interface CanvasProps {
  imageSrc: string | null;
  shapes: Shape[];
  mode: DrawingMode;
  isDrawing: boolean;
  currentShape: Shape | null;
  selectedShapeId: string | null;
  previewPoint: Point | null;
  dragState: DrawingState['dragState'];
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: () => void;
  onDimensionsChange?: (dimensions: {
    canvasWidth: number;
    canvasHeight: number;
    imageNaturalWidth: number;
    imageNaturalHeight: number;
  }) => void;
  className?: string;
}

export interface CameraSnapshotResponse {
  success: boolean;
  message?: string;
  data?: Blob;
}
