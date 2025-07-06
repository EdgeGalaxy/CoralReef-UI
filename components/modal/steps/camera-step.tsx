import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Video, Usb, File, Edit2, Check, X as XIcon } from 'lucide-react';
import { SourceDataModel, CameraType } from '@/constants/deploy';
import { useAuthSWR } from '@/components/hooks/useAuthReq';

interface CameraStepSelectedItemProps {
  selectedItem: SourceDataModel; // Replace 'any' with your specific type
  handleRemoveItem: () => void;
}

// 定义视频信息类型
interface VideoInfo {
  width: number | null;
  height: number | null;
  fps: number | null;
}

export const CameraStepSelectedItem: React.FC<CameraStepSelectedItemProps> = ({
  selectedItem,
  handleRemoveItem
}) => {
  // 获取视频信息
  const { data: videoInfo } = useAuthSWR<VideoInfo>(
    selectedItem.workspace_id && selectedItem.id
      ? `/api/reef/workspaces/${selectedItem.workspace_id}/cameras/${selectedItem.id}/video-info`
      : null
  );

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [editableVideoInfo, setEditableVideoInfo] = useState<VideoInfo>({
    width: null,
    height: null,
    fps: null
  });

  // 当获取到视频信息时，更新可编辑的信息
  useEffect(() => {
    if (videoInfo) {
      setEditableVideoInfo(videoInfo);
    }
  }, [videoInfo]);

  const getCameraIcon = (type: CameraType) => {
    switch (type) {
      case CameraType.RTSP:
        return <Video className="h-4 w-4" />;
      case CameraType.USB:
        return <Usb className="h-4 w-4" />;
      case CameraType.FILE:
        return <File className="h-4 w-4" />;
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // 这里可以添加保存逻辑，比如调用API更新数据
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 恢复原始数据
    if (videoInfo) {
      setEditableVideoInfo(videoInfo);
    }
  };

  const handleInputChange = (field: keyof VideoInfo, value: string) => {
    const numValue = value === '' ? null : Number(value);
    setEditableVideoInfo((prev) => ({
      ...prev,
      [field]: numValue
    }));
  };

  return (
    <Card className="relative mt-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => handleRemoveItem()}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">
            {getCameraIcon(selectedItem.type)}
          </div>
          <CardTitle>{selectedItem.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {selectedItem.type}
          </Badge>
        </div>
        <CardDescription className="space-y-1">
          <p>{selectedItem.description}</p>
          <div className="text-sm text-muted-foreground">
            <p>路径: {selectedItem.path}</p>
          </div>

          {/* 视频信息显示/编辑 */}
          <div className="mt-3 rounded-md bg-muted/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                视频信息
              </div>
              <div className="flex gap-1">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={handleSave}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={handleCancel}
                    >
                      <XIcon className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* 分辨率 */}
              <div>
                <span className="text-muted-foreground">分辨率: </span>
                {isEditing ? (
                  <div className="mt-1 flex gap-1">
                    <Input
                      type="number"
                      placeholder="宽度"
                      value={editableVideoInfo.width || ''}
                      onChange={(e) =>
                        handleInputChange('width', e.target.value)
                      }
                      className="h-6 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">×</span>
                    <Input
                      type="number"
                      placeholder="高度"
                      value={editableVideoInfo.height || ''}
                      onChange={(e) =>
                        handleInputChange('height', e.target.value)
                      }
                      className="h-6 text-xs"
                    />
                  </div>
                ) : (
                  <span className="font-medium">
                    {editableVideoInfo.width && editableVideoInfo.height
                      ? `${editableVideoInfo.width}×${editableVideoInfo.height}`
                      : '未设置'}
                  </span>
                )}
              </div>

              {/* 帧率 */}
              <div>
                <span className="text-muted-foreground">帧率: </span>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="帧率"
                    value={editableVideoInfo.fps || ''}
                    onChange={(e) => handleInputChange('fps', e.target.value)}
                    className="mt-1 h-6 text-xs"
                  />
                ) : (
                  <span className="font-medium">
                    {editableVideoInfo.fps
                      ? `${editableVideoInfo.fps.toFixed(1)} fps`
                      : '未设置'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
