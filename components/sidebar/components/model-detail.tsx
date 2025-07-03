'use client';

import { MLModel, MLPlatform, DatasetType } from '@/constants/models';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi } from '@/components/hooks/useAuthReq';

interface ModelDetailProps {
  model: MLModel;
  workspaceId: string;
  onRefresh?: () => void;
  onClose?: () => void;
}

export function ModelDetail({
  model,
  workspaceId,
  onRefresh
}: ModelDetailProps) {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();
  const api = useAuthApi();

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleConvertToRKNN = async () => {
    try {
      setIsConverting(true);
      await api.post(
        `api/reef/workspaces/${workspaceId}/models/${model.id}/convert`
      );

      toast({
        title: '成功',
        description: 'RKNN模型转换成功'
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: 'RKNN模型转换失败'
      });
      console.error('Convert error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const DownloadButton = ({ url, label }: { url?: string; label: string }) => {
    if (!url) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="space-x-2"
                >
                  <Icons.download className="h-4 w-4" />
                  <span>下载</span>
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}不存在</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownload(url)}
        className="space-x-2"
      >
        <Icons.download className="h-4 w-4" />
        <span>下载</span>
      </Button>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 p-4">
        {/* 预处理配置 */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="preprocessing">
            <AccordionTrigger>预处理配置</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">图像方向</h4>
                  <p className="text-sm text-muted-foreground">
                    {model.preprocessing_config.auto_orient.enabled
                      ? '启用'
                      : '禁用'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">调整大小</h4>
                  {model.preprocessing_config.resize.enabled && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          格式：
                        </span>
                        <span>{model.preprocessing_config.resize.format}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          宽度：
                        </span>
                        <span>{model.preprocessing_config.resize.width}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          高度：
                        </span>
                        <span>{model.preprocessing_config.resize.height}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 类别映射 */}
          <AccordionItem value="class-mapping">
            <AccordionTrigger>类别映射</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(model.class_mapping).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{key}:</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {value}
                      </span>
                    </div>
                    {model.class_colors?.[key] && (
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: model.class_colors[key] }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 模型文件 */}
          <AccordionItem value="model-files">
            <AccordionTrigger>模型文件</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">ONNX 模型</h4>
                  <DownloadButton url={model.onnx_model_url} label="ONNX模型" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">RKNN 模型</h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConvertToRKNN}
                      disabled={isConverting}
                      className="space-x-2"
                    >
                      {isConverting ? (
                        <>
                          <Icons.spinner className="h-4 w-4 animate-spin" />
                          <span>转换中</span>
                        </>
                      ) : (
                        <>
                          <Icons.refreshCw className="h-4 w-4" />
                          <span>转换</span>
                        </>
                      )}
                    </Button>
                    <DownloadButton
                      url={model.rknn_model_url}
                      label="RKNN模型"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
