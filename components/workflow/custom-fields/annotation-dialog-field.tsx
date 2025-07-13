'use client';

import React, { useState } from 'react';
import { FieldProps } from '@rjsf/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Edit3 } from 'lucide-react';

import ImageAnnotationField from './image-annotation/image-annotation-field';
import { Point } from './image-annotation/types';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AnnotationDialogFieldProps {
  onChange: (value: any) => void;
  formData: any;
}

const AnnotationDialogField: React.FC<AnnotationDialogFieldProps> = (props) => {
  const { onChange, formData } = props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 获取当前的标注数据，将 number[][] 转换为 Point[][]
  const annotations: Point[][] = (formData || []).map((shape: number[][]) =>
    shape.map((coords: number[]) => ({ x: coords[0], y: coords[1] }))
  );
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) || session.data?.user.select_workspace_id;

  // 处理标注数据的提交
  const handleAnnotationSubmit = (coordinates: Point[][]) => {
    // 转换为纯数字数组格式 [[x, y], [x, y], ...]
    const numericCoordinates = coordinates.map((shape) =>
      shape.map((point) => [point.x, point.y])
    );
    onChange(numericCoordinates);
    setIsDialogOpen(false);
  };

  // 格式化显示的参数值 - 确保显示为 [[x, y], [x, y]] 格式
  const displayValue =
    formData && formData.length > 0
      ? JSON.stringify(
          formData.map((shape: any) => {
            // 如果已经是数字数组格式 [[x, y], [x, y]]
            if (Array.isArray(shape) && Array.isArray(shape[0])) {
              return shape;
            }
            // 如果是对象数组格式 [{x, y}, {x, y}]
            if (
              Array.isArray(shape) &&
              shape.length > 0 &&
              typeof shape[0] === 'object'
            ) {
              return shape.map((point: any) => [point.x, point.y]);
            }
            // 其他格式，尝试转换
            return shape;
          })
        )
      : '';

  return (
    <div className="space-y-3">
      {/* 编辑按钮 */}
      <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Edit3 className="mr-2 h-4 w-4" />
              {formData && formData.length > 0 ? '编辑画布' : '创建画布'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-7xl overflow-hidden">
            <DialogHeader>
              <DialogTitle>画布</DialogTitle>
              <DialogDescription>
                请选择图片并进行画布标注。支持绘制线条和多边形，可拖拽编辑。
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <ImageAnnotationField
                value={annotations}
                workspaceId={workspaceId}
                onChange={handleAnnotationSubmit}
                defaultMode="select"
                maxShapes={20}
                allowedFileTypes={['image/*', 'video/*']}
                className="h-[70vh]"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 只读输入框显示参数值 */}
      <div>
        <Input
          readOnly
          value={displayValue}
          placeholder="标注坐标将显示在这里，格式如: [[2, 3], [4, 5]]"
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
};

export default AnnotationDialogField;
