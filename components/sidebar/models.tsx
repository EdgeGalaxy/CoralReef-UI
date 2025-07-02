'use client';

import { MLModel } from '@/constants/models';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sidebar } from './_sidebar';
import { EditableField } from './components/editable-field';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import React from 'react';
import { ModelDetail as ModelDetailView } from '@/components/sidebar/components/model-detail';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  model: MLModel;
  workspaceId: string;
  onRefresh: () => void;
  onClose: () => void;
}

function ModelDetail({ model, workspaceId, onRefresh, onClose }: Props) {
  const api = useAuthApi();
  const { toast } = useToast();
  const [operationType, setOperationType] = React.useState<string | null>(null);

  const handleOperation = async (
    type: string,
    operation: () => Promise<void>
  ) => {
    if (operationType) return;
    setOperationType(type);
    try {
      await operation();
    } finally {
      setOperationType(null);
    }
  };

  const handleUpdate = async (field: keyof MLModel, newValue: string) => {
    await handleApiRequest(
      () =>
        api.put(`api/reef/workspaces/${workspaceId}/models/${model.id}`, {
          json: {
            [field]: newValue
          }
        }),
      {
        toast,
        successTitle: '模型更新成功',
        errorTitle: '模型更新失败',
        onSuccess: onRefresh
      }
    );
  };

  const handleDelete = () => {
    return handleOperation('delete', async () => {
      await handleApiRequest(
        () =>
          api.delete(
            `api/reef/workspaces/${model.workspace_id}/models/${model.id}`
          ),
        {
          toast,
          successTitle: '模型删除成功',
          errorTitle: '模型删除失败',
          onSuccess: () => {
            onRefresh();
            onClose();
          }
        }
      );
    });
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">模型唯一标识</span>
          <span className="font-medium">{model.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">模型类型</span>
          <span className="font-medium">{model.model_type}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">任务类型</span>
          <span className="font-medium">{model.task_type}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">创建时间</span>
          <span className="font-medium">
            {new Date(model.created_at).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex items-center space-x-4">
        <Badge
          variant="outline"
          className={cn(
            'flex items-center gap-1 font-normal',
            model.is_public
              ? 'border-green-500 text-green-500'
              : 'border-orange-500 text-orange-500'
          )}
        >
          {model.is_public ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
          {model.is_public ? '公开' : '私密'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={!!operationType && operationType !== 'refresh'}
          onClick={() => handleOperation('refresh', async () => onRefresh())}
        >
          {operationType === 'refresh' ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.refreshCw className="mr-2 h-4 w-4" />
          )}
          刷新
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={!!operationType && operationType !== 'delete'}
          onClick={() => handleOperation('delete', async () => handleDelete())}
        >
          {operationType === 'delete' ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.trash2 className="mr-2 h-4 w-4" />
          )}
          删除
        </Button>
      </div>
    </div>
  );
}

export function ModelSidebar({
  model,
  workspaceId,
  onRefresh,
  onClose
}: Props) {
  const tabConfig = [
    {
      value: 'details',
      label: '详情',
      content: (
        <ModelDetailView
          model={model}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      )
    },
    {
      value: 'settings',
      label: '设置',
      content: <div>设置内容</div>
    }
  ];

  return (
    <Sidebar
      title={model.name}
      onClose={onClose}
      detailContent={
        <ModelDetail
          model={model}
          workspaceId={workspaceId}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      }
      tabs={tabConfig}
      defaultTab="details"
    />
  );
}
