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

import WebRTCPreview from './components/webrtc-preview';

interface DeploymentDiffResponse {
  workflow_changed: boolean;
  cameras_changed: boolean;
}

interface Props {
  deployment: DeploymentDataModel;
  onClose: () => void;
  onRefresh: () => void;
}

function DeploymentDetail({ deployment, onRefresh, onClose }: Props) {
  const api = useAuthApi();
  const { toast } = useToast();
  const [operationType, setOperationType] = React.useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = React.useState<boolean>(false);
  const is_not_found = deployment.running_status === OperationStatus.NOT_FOUND;
  const is_muted = deployment.running_status === OperationStatus.MUTED;

  const checkUpdate = React.useCallback(async () => {
    try {
      const response = await api.get(
        `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}/compare`
      );
      const data = (await response.json()) as DeploymentDiffResponse;
      const needsUpdate =
        data.workflow_changed || data.cameras_changed || false;
      setHasUpdate(needsUpdate);
    } catch (error) {
      console.error('检查更新失败:', error);
    }
  }, [api, deployment.id, deployment.workspace_id]);

  React.useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  const handleOperation = async (
    type: string,
    operation: () => Promise<void>
  ): Promise<void> => {
    if (operationType) return;
    setOperationType(type);
    try {
      await operation();
    } finally {
      setOperationType(null);
    }
  };

  const handlePause = async (): Promise<void> => {
    await handleApiRequest(
      () =>
        api.post(
          `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}/pause`
        ),
      {
        toast,
        successTitle: '暂停成功',
        errorTitle: '暂停失败',
        onSuccess: onRefresh
      }
    );
  };

  const handleResume = async (): Promise<void> => {
    await handleApiRequest(
      () =>
        api.post(
          `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}/resume`
        ),
      {
        toast,
        successTitle: '恢复成功',
        errorTitle: '恢复失败',
        onSuccess: onRefresh
      }
    );
  };

  const handleUpdate = async (
    field: keyof DeploymentDataModel,
    newValue: string
  ): Promise<void> => {
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

  const handleRestart = async (): Promise<void> => {
    await handleApiRequest(
      () =>
        api.post(
          `api/reef/workspaces/${deployment.workspace_id}/deployments/${deployment.id}/restart`
        ),
      {
        toast,
        successTitle: '操作完成',
        errorTitle: '操作失败',
        onSuccess: () => {
          onRefresh();
          checkUpdate();
        }
      }
    );
  };

  const handleDelete = async (): Promise<void> => {
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
            is_not_found ||
            (!!operationType &&
              operationType !== (is_muted ? 'resume' : 'muted'))
          }
          onClick={() =>
            handleOperation(is_muted ? 'resume' : 'muted', async () =>
              is_muted ? handleResume() : handlePause()
            )
          }
        >
          {operationType === (is_muted ? 'resume' : 'muted') ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.stopped className="mr-2 h-4 w-4" />
          )}
          {is_muted ? '恢复' : '暂停'}
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
          disabled={
            !hasUpdate ||
            is_not_found ||
            (!!operationType && operationType !== 'update')
          }
          onClick={() => handleOperation('update', async () => handleRestart())}
        >
          {operationType === 'update' ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.refreshCw className="mr-2 h-4 w-4" />
          )}
          {hasUpdate ? '更新可用' : '已是最新'}
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
      content: <WebRTCPreview deployment={deployment} />
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
