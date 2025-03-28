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
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import { RefreshCw } from 'lucide-react';
import { MLPlatform, MLModel } from '@/constants/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomModelForm, CustomModelFormValues } from './models/custom';
import { RoboflowModelForm, RoboflowModelFormValues } from './models/roboflow';

interface Props {
  workspaceId: string;
  onSuccess?: () => void;
  models?: MLModel[];
}

export default function CreateModelDialog({
  workspaceId,
  onSuccess,
  models = []
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<MLPlatform>(MLPlatform.CUSTOM);
  const { toast } = useToast();
  const api = useAuthApi();

  const isModelNameExists = (name: string): boolean => {
    return models.some(
      (model) => model.name.toLowerCase() === name.toLowerCase()
    );
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
    if (values.model_id && isModelNameExists(values.model_id)) {
      toast({
        title: '创建失败',
        description: '模型名称已存在，请使用其他名称',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.post(
            `api/reef/workspaces/${workspaceId}/models/public/${values.model_id}`,
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
          className="flex max-h-[80vh] min-h-[300px] w-[90vw] min-w-[500px] flex-col overflow-hidden sm:w-[50vw] sm:max-w-[50vw]"
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
          <div className="flex-none">
            <DialogHeader>
              <DialogTitle>创建模型</DialogTitle>
              <DialogDescription>
                选择创建自定义模型或导入开源模型
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as MLPlatform)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={MLPlatform.CUSTOM}>自定义模型</TabsTrigger>
                <TabsTrigger value={MLPlatform.PUBLIC}>开源模型</TabsTrigger>
              </TabsList>

              <TabsContent value={MLPlatform.CUSTOM}>
                <CustomModelForm
                  onSubmit={onSubmitCustom}
                  isLoading={isLoading}
                  workspaceId={workspaceId}
                />
              </TabsContent>

              <TabsContent value={MLPlatform.PUBLIC}>
                <RoboflowModelForm
                  onSubmit={onSubmitRoboflow}
                  isLoading={isLoading}
                  workspaceId={workspaceId}
                />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
