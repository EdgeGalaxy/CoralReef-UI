'use client';

import React, { useState } from 'react';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi } from '@/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import { RefreshCw } from 'lucide-react';
import { MLPlatform, MLTaskType, DatasetType } from '@/constants/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomModelForm, CustomModelFormValues } from './models/custom';
import { RoboflowModelForm } from './models/roboflow';

const customModelSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
  platform: z.literal(MLPlatform.CUSTOM),
  dataset_url: z.string().optional(),
  dataset_type: z.nativeEnum(DatasetType).optional(),
  preprocessing_config: z.object({
    auto_orient: z.object({
      enabled: z.boolean()
    }),
    resize: z.object({
      format: z.string(),
      width: z.number(),
      height: z.number(),
      enabled: z.boolean()
    })
  }),
  class_mapping: z.record(z.string()),
  task_type: z.nativeEnum(MLTaskType),
  model_type: z.string(),
  onnx_model_url: z.string(),
  version: z.string(),
  batch_size: z.number().default(8)
});

const roboflowModelSchema = z.object({
  model_id: z.string().min(1, '模型ID不能为空'),
  platform: z.literal(MLPlatform.ROBOFLOW)
});

type RoboflowModelFormValues = z.infer<typeof roboflowModelSchema>;

interface Props {
  workspaceId: string;
  onSuccess?: () => void;
}

export default function CreateModelDialog({ workspaceId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<MLPlatform>(MLPlatform.CUSTOM);
  const { toast } = useToast();
  const api = useAuthApi();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  };

  async function onSubmitCustom(values: CustomModelFormValues) {
    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.post(`api/reef/workspaces/${workspaceId}/models/custom`, {
            json: values
          }),
        {
          toast,
          successTitle: '创建成功',
          errorTitle: '创建失败',
          onSuccess: () => {
            setIsOpen(false);
            onSuccess?.();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitRoboflow(values: RoboflowModelFormValues) {
    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.post(
            `api/reef/workspaces/${workspaceId}/models/roboflow/${values.model_id}`,
            {}
          ),
        {
          toast,
          successTitle: '创建成功',
          errorTitle: '创建失败',
          onSuccess: () => {
            setIsOpen(false);
            onSuccess?.();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>创建模型</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-h-[80vh] min-h-[300px] w-[90vw] min-w-[500px] overflow-y-auto sm:w-[50vw] sm:max-w-[50vw]"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          )}
          <DialogHeader>
            <DialogTitle>创建模型</DialogTitle>
            <DialogDescription>
              选择创建自定义模型或导入 Roboflow 模型
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as MLPlatform)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={MLPlatform.CUSTOM}>自定义模型</TabsTrigger>
              <TabsTrigger value={MLPlatform.ROBOFLOW}>
                Roboflow模型
              </TabsTrigger>
            </TabsList>

            <TabsContent value={MLPlatform.CUSTOM}>
              <CustomModelForm
                onSubmit={onSubmitCustom}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value={MLPlatform.ROBOFLOW}>
              <RoboflowModelForm
                onSubmit={onSubmitRoboflow}
                isLoading={isLoading}
                workspaceId={workspaceId}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
