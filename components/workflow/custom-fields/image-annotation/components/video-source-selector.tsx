'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Camera, Loader2 } from 'lucide-react';
import { useCameras } from '@/components/hooks/useCameras';

interface VideoSourceSelectorProps {
  workspaceId: string;
  onImageUpload: (file: File) => void;
  onSnapshotTaken?: () => void;
}

export function VideoSourceSelector({
  workspaceId,
  onImageUpload,
  onSnapshotTaken
}: VideoSourceSelectorProps) {
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);

  const { cameras, isLoadingCameras, getCameraSnapshotAsFile, error } =
    useCameras(workspaceId);

  const handleCameraSelect = (cameraId: string) => {
    setSelectedCameraId(cameraId);
  };

  const handleGetSnapshot = async () => {
    if (!selectedCameraId) return;

    setIsLoadingSnapshot(true);
    try {
      const file = await getCameraSnapshotAsFile(selectedCameraId);
      if (file) {
        onImageUpload(file);
        onSnapshotTaken?.();
      }
    } catch (error) {
      console.error('获取快照失败:', error);
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  if (error) {
    return (
      <div className="rounded bg-red-50 p-2 text-sm text-red-600">
        加载摄像头列表失败
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">选择视频源</Label>
      <div className="space-y-2">
        <Select
          value={selectedCameraId}
          onValueChange={handleCameraSelect}
          disabled={isLoadingCameras}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={isLoadingCameras ? '加载中...' : '选择摄像头'}
            />
          </SelectTrigger>
          <SelectContent>
            {cameras.map((camera) => (
              <SelectItem key={camera.id} value={camera.id}>
                <div className="flex items-center space-x-2">
                  <Camera className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{camera.name}</div>
                    <div className="text-xs text-gray-500">
                      {camera.type.toUpperCase()} -{' '}
                      {camera.gateway_name || '直连'}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleGetSnapshot}
          disabled={!selectedCameraId || isLoadingSnapshot}
        >
          {isLoadingSnapshot ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              获取中...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              获取快照
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
