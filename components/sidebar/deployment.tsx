'use client';

import React from 'react';
import {
  DeploymentDataModel,
  OperationStatus,
  getStatusConfig
} from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sidebar } from './_sidebar';
import { EditableField } from './components/editable-field';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import { handleApiRequest } from '@/lib/error-handle';

interface Props {
  deployment: DeploymentDataModel;
  onClose: () => void;
  onRefresh: () => void;
}

function DeploymentDetail({ deployment, onRefresh, onClose }: Props) {
  const api = useAuthApi();
  const { toast } = useToast();
  const [operationType, setOperationType] = React.useState<string | null>(null);
  const is_disabled = deployment.running_status !== OperationStatus.RUNNING;

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

  const handleUpdate = async (
    field: keyof DeploymentDataModel,
    newValue: string
  ) => {
    await handleApiRequest(
      () =>
        api.put(
          `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}`,
          { json: { [field]: newValue } }
        ),
      {
        toast,
        successTitle: '更新成功',
        errorTitle: '更新失败',
        onSuccess: onRefresh
      }
    );
  };

  const handleDelete = () => {
    return handleOperation('delete', async () => {
      await handleApiRequest(
        () =>
          api.delete(
            `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}`
          ),
        {
          toast,
          successTitle: '服务删除成功',
          errorTitle: '服务删除失败',
          onSuccess: () => {
            onRefresh();
            onClose();
          }
        }
      );
    });
  };

  const status = getStatusConfig(deployment.running_status);

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <EditableField
          value={deployment.name}
          label="服务名"
          onUpdate={(newValue) => handleUpdate('name', newValue)}
        />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">网关</span>
          <span className="font-medium">{deployment.gateway_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">工作流</span>
          <span className="font-medium">{deployment.workflow_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">创建时间</span>
          <span className="font-medium">
            {new Date(deployment.created_at).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button
          size="sm"
          className={`text-xs bg-${status.color}-500 hover:bg-${status.color}-600`}
        >
          {React.createElement(Icons[status.icon], {
            className: 'mr-2 h-4 w-4'
          })}
          {status.text}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={
            is_disabled || (!!operationType && operationType !== 'restart')
          }
          onClick={() => handleOperation('restart', async () => onRefresh())}
        >
          {operationType === 'restart' ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.power className="mr-2 h-4 w-4" />
          )}
          重启
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={
            is_disabled || (!!operationType && operationType !== 'stop')
          }
          onClick={() => handleOperation('stop', async () => onRefresh())}
        >
          {operationType === 'stop' ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.stopped className="mr-2 h-4 w-4" />
          )}
          停止
        </Button>
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

export function DeploymentSidebar({ deployment, onClose, onRefresh }: Props) {
  const tabConfig = [
    {
      value: 'stream',
      label: '数据流',
      content: <div>数据流内容</div>
    },
    {
      value: 'logs',
      label: '服务日志',
      content: <div>日志内容</div>
    },
    {
      value: 'metrics',
      label: '指标',
      content: <div>指标内容</div>
    },
    {
      value: 'events',
      label: '操作日志',
      content: <div>操作日志内容</div>
    },
    {
      value: 'settings',
      label: '设置',
      content: <div>设置内容</div>
    }
  ];

  return (
    <Sidebar
      title={deployment.name}
      onClose={onClose}
      detailContent={
        <DeploymentDetail
          deployment={deployment}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      }
      tabs={tabConfig}
      defaultTab="stream"
    />
  );
}
