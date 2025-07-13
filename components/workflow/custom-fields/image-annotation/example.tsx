'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Download, RefreshCw } from 'lucide-react';

import ImageAnnotation from './index';
import { Point } from './types';

export default function ImageAnnotationExample() {
  const [annotations, setAnnotations] = useState<Point[][]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (coordinates: Point[][]) => {
    setAnnotations(coordinates);
    console.log('标注坐标:', coordinates);

    // 这里可以调用API保存标注数据
    // await saveAnnotations(coordinates);
  };

  const handleReset = () => {
    setIsResetting(true);
    setAnnotations([]);

    // 模拟重置过程
    setTimeout(() => {
      setIsResetting(false);
      toast({
        title: '重置完成',
        description: '标注数据已清空'
      });
    }, 500);
  };

  const handleCopyCoordinates = () => {
    if (annotations.length === 0) {
      toast({
        title: '没有标注数据',
        description: '请先进行标注操作',
        variant: 'destructive'
      });
      return;
    }

    const coordinatesText = JSON.stringify(annotations, null, 2);
    navigator.clipboard.writeText(coordinatesText);

    toast({
      title: '复制成功',
      description: '坐标数据已复制到剪贴板'
    });
  };

  const handleDownload = () => {
    if (annotations.length === 0) {
      toast({
        title: '没有标注数据',
        description: '请先进行标注操作',
        variant: 'destructive'
      });
      return;
    }

    const data = {
      timestamp: new Date().toISOString(),
      annotations: annotations,
      meta: {
        count: annotations.length,
        version: '1.0.0'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '下载完成',
      description: '标注数据已保存为JSON文件'
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>图片标注组件示例</CardTitle>
          <CardDescription>
            演示如何使用ImageAnnotation组件进行图片标注。支持线条和多边形绘制，提供完整的编辑功能。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 主要标注区域 */}
            <div className="lg:col-span-2">
              <ImageAnnotation
                onSubmit={handleSubmit}
                workspaceId="demo-workspace"
                cameraId="demo-camera"
                defaultMode="select"
                maxShapes={20}
                allowedFileTypes={['image/*', 'video/*']}
                className="w-full"
              />
            </div>

            {/* 侧边栏 - 结果显示和操作 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">标注结果</CardTitle>
                  <CardDescription>
                    {annotations.length > 0
                      ? `共有 ${annotations.length} 个标注对象`
                      : '尚无标注数据'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {annotations.length > 0 && (
                    <div className="space-y-2">
                      {annotations.map((shape, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {shape.length === 2 ? '线条' : '多边形'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {shape.length} 个点
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      onClick={handleCopyCoordinates}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={annotations.length === 0}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      复制坐标
                    </Button>

                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={annotations.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载JSON
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isResetting}
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                          isResetting ? 'animate-spin' : ''
                        }`}
                      />
                      重置数据
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 坐标预览 */}
              {annotations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">坐标预览</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto">
                      <pre className="rounded bg-gray-100 p-3 font-mono text-xs">
                        {JSON.stringify(annotations, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-semibold">📸 图片加载</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 点击"选择文件"上传本地图片或视频</li>
                <li>• 视频文件会自动提取第一帧</li>
                <li>• 支持摄像头快照（需要配置ID）</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">🎨 绘制操作</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 选择"画线"模式：点击两点画线</li>
                <li>• 选择"画多边形"：连续点击多点闭合</li>
                <li>• 选择"选择"模式：编辑已有图形</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">✏️ 编辑功能</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 拖拽顶点调整形状</li>
                <li>• 拖拽图形整体移动</li>
                <li>• Delete键删除选中图形</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">⌨️ 快捷键</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Ctrl/Cmd + Z：撤销</li>
                <li>• Ctrl/Cmd + Y：重做</li>
                <li>• Ctrl/Cmd + S：保存</li>
                <li>• Esc：取消当前操作</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
