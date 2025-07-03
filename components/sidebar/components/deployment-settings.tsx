'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { DeploymentDataModel } from '@/constants/deploy';
import { useAuthApi, useAuthSWR } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  deployment: DeploymentDataModel;
  onRefresh: () => void;
  onSavingChange?: (isSaving: boolean) => void;
}

export function DeploymentSettings({
  deployment,
  onRefresh,
  onSavingChange
}: Props) {
  const api = useAuthApi();
  const { toast } = useToast();
  const [cameras, setCameras] = useState<Record<string, string>>(() => {
    const cameraMap: Record<string, string> = {};
    deployment.camera_ids?.forEach((id, index) => {
      cameraMap[id] = deployment.camera_names?.[index] || '';
    });
    return cameraMap;
  });
  const [newCameraIds, setNewCameraIds] = useState<Set<string>>(new Set());
  const [parameters, setParameters] = useState<Record<string, any>>(
    deployment.parameters || {}
  );
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: availableCameras } = useAuthSWR<any[]>(
    `/api/reef/workspaces/${deployment.workspace_id}/cameras`
  );

  const filteredCameras = useMemo(() => {
    if (!availableCameras) return [];
    return availableCameras.filter(
      (camera) => !Object.keys(cameras).includes(camera.id)
    );
  }, [availableCameras, cameras]);

  const handleAddCamera = (id: string, name: string) => {
    setCameras({
      ...cameras,
      [id]: name
    });
    setNewCameraIds(new Set(Array.from(newCameraIds).concat(id)));
  };

  const handleRemoveCamera = (id: string) => {
    const newCameras = { ...cameras };
    delete newCameras[id];
    setCameras(newCameras);
    setNewCameraIds(
      new Set(Array.from(newCameraIds).filter((cameraId) => cameraId !== id))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    onSavingChange?.(true);
    try {
      await api.put(
        `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}`,
        {
          json: {
            camera_ids: Object.keys(cameras),
            parameters: parameters
          }
        }
      );
      toast({
        title: '设置已更新',
        description: '服务将重新启动以应用新的配置'
      });
      setNewCameraIds(new Set()); // 清除新添加标记
      onRefresh();
    } catch (error) {
      toast({
        title: '更新失败',
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
      onSavingChange?.(false);
      setShowSaveDialog(false);
    }
  };

  return (
    <div
      className={cn(
        'relative space-y-6 p-4',
        isSaving && 'pointer-events-none opacity-50'
      )}
    >
      {isSaving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">正在保存设置...</p>
          </div>
        </div>
      )}

      {/* 摄像头管理 */}
      <div>
        <h3 className="mb-4 text-lg font-medium">摄像头管理</h3>
        <div className="space-y-4">
          {Object.entries(cameras).map(([id, name]) => (
            <Card
              key={id}
              className={`p-4 ${
                newCameraIds.has(id) ? 'border-orange-500 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCamera(id)}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>添加摄像头</Label>
                <Select
                  value=""
                  onValueChange={(id) => {
                    const camera = filteredCameras.find((c) => c.id === id);
                    if (camera) {
                      handleAddCamera(camera.id, camera.name);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择要添加的摄像头" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.id}>
                        {camera.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 参数设置 */}
      {Object.keys(parameters).length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-medium">参数设置</h3>
          <Card className="p-4">
            <div className="space-y-4">
              {Object.entries(parameters).map(([key, value]) => (
                <div key={key} className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">{key}</Label>
                  <div className="col-span-3">
                    <Input
                      value={String(value)}
                      onChange={(e) =>
                        setParameters({
                          ...parameters,
                          [key]: e.target.value
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button onClick={() => setShowSaveDialog(true)}>保存更改</Button>
      </div>

      {/* 确认对话框 */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认更新设置？</AlertDialogTitle>
            <AlertDialogDescription>
              更新设置将导致服务重新启动，期间服务可能暂时不可用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary"
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
