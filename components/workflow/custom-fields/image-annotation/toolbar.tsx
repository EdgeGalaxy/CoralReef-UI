'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Camera,
  Image,
  Trash2,
  Undo2,
  Redo2,
  Minus,
  Pentagon,
  MousePointer
} from 'lucide-react';

import { ToolbarProps, DrawingMode } from './types';
import { isVideoFile, isImageFile, extractVideoFrame } from './utils';
import { VideoSourceSelector } from './components/video-source-selector';

export function Toolbar({
  mode,
  onModeChange,
  onImageUpload,
  onCameraSnapshot,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  workspaceId,
  cameraId
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (isVideoFile(file)) {
        toast({
          title: '处理视频文件',
          description: '正在提取视频第一帧...'
        });

        const frameDataUrl = await extractVideoFrame(file);
        const blob = await fetch(frameDataUrl).then((res) => res.blob());
        const frameFile = new File(
          [blob],
          `${file.name.split('.')[0]}_frame.jpg`,
          { type: 'image/jpeg' }
        );
        onImageUpload(frameFile);

        toast({
          title: '处理完成',
          description: '视频第一帧已成功提取'
        });
      } else if (isImageFile(file)) {
        onImageUpload(file);
      } else {
        toast({
          title: '文件格式不支持',
          description: '请选择图片或视频文件',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '文件处理失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getModeIcon = (drawingMode: DrawingMode) => {
    switch (drawingMode) {
      case 'line':
        return <Minus className="h-4 w-4" />;
      case 'polygon':
        return <Pentagon className="h-4 w-4" />;
      case 'select':
        return <MousePointer className="h-4 w-4" />;
      default:
        return <MousePointer className="h-4 w-4" />;
    }
  };

  const getModeText = (drawingMode: DrawingMode) => {
    switch (drawingMode) {
      case 'line':
        return '画线';
      case 'polygon':
        return '画多边形';
      case 'select':
        return '选择';
      default:
        return '选择';
    }
  };

  return (
    <Card className="h-fit w-64">
      <CardHeader>
        <CardTitle className="text-lg">图片标注工具</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 图片选择区域 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">选择图片</Label>
          <div className="space-y-4">
            {/* 本地文件选择 */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" />
                选择文件
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* 视频源选择 */}
            {workspaceId && (
              <VideoSourceSelector
                workspaceId={workspaceId}
                onImageUpload={onImageUpload}
                onSnapshotTaken={onCameraSnapshot}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* 操作模式选择 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">操作模式</Label>
          <RadioGroup value={mode} onValueChange={onModeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="select" id="select" />
              <Label
                htmlFor="select"
                className="flex cursor-pointer items-center gap-2"
              >
                <MousePointer className="h-4 w-4" />
                选择
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="line" id="line" />
              <Label
                htmlFor="line"
                className="flex cursor-pointer items-center gap-2"
              >
                <Minus className="h-4 w-4" />
                画线
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="polygon" id="polygon" />
              <Label
                htmlFor="polygon"
                className="flex cursor-pointer items-center gap-2"
              >
                <Pentagon className="h-4 w-4" />
                画多边形
              </Label>
            </div>
          </RadioGroup>

          <Badge variant="secondary" className="w-fit">
            {getModeIcon(mode)}
            <span className="ml-1">{getModeText(mode)}</span>
          </Badge>
        </div>

        <Separator />

        {/* 操作按钮 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">操作</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-1"
            >
              <Undo2 className="h-3 w-3" />
              撤销
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center gap-1"
            >
              <Redo2 className="h-3 w-3" />
              重做
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="flex w-full items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            清除所有
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
