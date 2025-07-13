'use client';

import { useCallback } from 'react';
import { useAuthApi, useAuthSWR } from './useAuthReq';
import { CameraModel, CameraSnapshotResponse } from '@/constants/camera';
import { useToast } from '@/components/ui/use-toast';
import { handleApiRequest } from '@/lib/error-handle';

export function useCameras(workspaceId: string) {
  const api = useAuthApi();
  const { toast } = useToast();

  // 获取摄像头列表
  const {
    data: cameras,
    error,
    mutate: refreshCameras,
    isLoading: isLoadingCameras
  } = useAuthSWR<CameraModel[]>(
    workspaceId ? `/api/reef/workspaces/${workspaceId}/cameras` : null
  );

  // 获取摄像头快照
  const getCameraSnapshot = useCallback(
    async (cameraId: string): Promise<CameraSnapshotResponse | null> => {
      if (!workspaceId || !cameraId) {
        toast({
          title: '参数错误',
          description: '缺少工作空间ID或摄像头ID',
          variant: 'destructive'
        });
        return null;
      }

      try {
        const response = await handleApiRequest<CameraSnapshotResponse>(
          () =>
            api.get(
              `api/reef/workspaces/${workspaceId}/cameras/${cameraId}/snapshot`
            ),
          {
            toast,
            successTitle: '快照获取成功',
            errorTitle: '获取快照失败'
          }
        );

        return response;
      } catch (error) {
        console.error('获取摄像头快照失败:', error);
        return null;
      }
    },
    [workspaceId]
  );

  // 将 base64 图片转换为 File 对象
  const convertBase64ToFile = useCallback(
    (
      base64Data: string,
      filename: string = `camera_snapshot_${Date.now()}.jpg`
    ): File => {
      // 如果 base64 数据包含 data URL 前缀，则移除它
      const base64String = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

      // 将 base64 转换为 Blob
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // 创建 File 对象
      return new File([blob], filename, { type: 'image/jpeg' });
    },
    []
  );

  // 获取摄像头快照并转换为 File 对象
  const getCameraSnapshotAsFile = useCallback(
    async (cameraId: string): Promise<File | null> => {
      const snapshot = await getCameraSnapshot(cameraId);

      if (
        !snapshot ||
        snapshot.status !== 'success' ||
        !snapshot.image_base64
      ) {
        return null;
      }

      return convertBase64ToFile(snapshot.image_base64);
    },
    [getCameraSnapshot, convertBase64ToFile]
  );

  return {
    cameras: cameras || [],
    error,
    isLoadingCameras,
    refreshCameras,
    getCameraSnapshot,
    getCameraSnapshotAsFile,
    convertBase64ToFile
  };
}
