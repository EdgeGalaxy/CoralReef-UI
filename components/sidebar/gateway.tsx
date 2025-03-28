'use client';

import { Gateway, SourceDataModel, GatewayStatus } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { DeploymentDataModel } from '@/constants/deploy';
import { useAuthSWR, useAuthApi } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import { Sidebar } from './_sidebar';
import { EditableField } from './components/editable-field';
import { DeploymentTable } from '../tables/deployment/client';
import { SourceTable } from '../tables/source/client';
import { handleApiRequest } from '@/lib/error-handle';
import React from 'react';

interface Props {
  gateway: Gateway;
  onClose: () => void;
  onRefresh: () => void;
}

function GatewayDetail({ gateway, onRefresh, onClose }: Props) {
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

  const handleUpdate = async (field: keyof Gateway, newValue: string) => {
    await handleApiRequest(
      () =>
        api.put(
          `api/reef/workspaces/${gateway.workspace_id}/gateways/${gateway.id}`,
          {
            json: {
              [field]: newValue
            }
          }
        ),
      {
        toast,
        successTitle: '网关更新成功',
        errorTitle: '网关更新失败',
        onSuccess: onRefresh
      }
    );
  };

  const handleDelete = () => {
    return handleOperation('delete', async () => {
      await handleApiRequest(
        () =>
          api.delete(
            `api/reef/workspaces/${gateway.workspace_id}/gateways/${gateway.id}`
          ),
        {
          toast,
          successTitle: '网关删除成功',
          errorTitle: '网关删除失败',
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
          <span className="text-sm text-muted-foreground">IP地址</span>
          <span className="font-medium">{gateway.ip_address || '未设置'}</span>
        </div>
        <EditableField
          value={gateway.name}
          label="网关名"
          onUpdate={(newValue) => handleUpdate('name', newValue)}
        />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">版本</span>
          <span className="font-medium">{gateway.version}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">最后更新时间</span>
          <span className="font-medium">
            {new Date(gateway.updated_at).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button
          size="sm"
          className={`text-xs ${
            gateway.status === GatewayStatus.OFFLINE
              ? 'bg-red-500 hover:bg-red-500'
              : gateway.status === GatewayStatus.ONLINE
              ? 'bg-green-500 hover:bg-green-500'
              : 'bg-yellow-500 hover:bg-yellow-500'
          }`}
        >
          {gateway.status === GatewayStatus.OFFLINE ? (
            <Icons.offline className="mr-2 h-4 w-4" />
          ) : (
            <Icons.online className="mr-2 h-4 w-4" />
          )}
          {gateway.status === GatewayStatus.OFFLINE
            ? '离线'
            : gateway.status === GatewayStatus.ONLINE
            ? '在线'
            : '错误'}
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

export function GatewaySidebar({ gateway, onClose, onRefresh }: Props) {
  const { data: sources, error: sourcesError } = useAuthSWR<SourceDataModel[]>(
    `/api/reef/workspaces/${gateway.workspace_id}/gateways/${gateway.id}/cameras`
  );

  const { data: deployments, error: deploymentsError } = useAuthSWR<
    DeploymentDataModel[]
  >(
    `/api/reef/workspaces/${gateway.workspace_id}/gateways/${gateway.id}/deployments`
  );

  const tabConfig = [
    {
      value: 'sources',
      label: '关联数据源',
      content: sourcesError ? (
        <div>Error loading sources</div>
      ) : !sources ? (
        <div>Loading...</div>
      ) : (
        <SourceTable
          sources={sources}
          onSelectSource={(source: SourceDataModel) => {}}
        />
      )
    },
    {
      value: 'deployments',
      label: '关联服务',
      content: deploymentsError ? (
        <div>Error loading deployments</div>
      ) : !deployments ? (
        <div>Loading...</div>
      ) : (
        <DeploymentTable
          deployments={deployments}
          onSelectDeployment={(deployment: DeploymentDataModel) => {}}
        />
      )
    },
    {
      value: 'events',
      label: '操作日志',
      content: <div>操作日志内容</div>
    },
    {
      value: 'hardware',
      label: '硬件信息',
      content: <div>硬件信息内容</div>
    },
    {
      value: 'settings',
      label: '设置',
      content: <div>设置内容</div>
    }
  ];

  return (
    <Sidebar
      title={gateway.name}
      onClose={onClose}
      detailContent={
        <GatewayDetail
          gateway={gateway}
          onRefresh={onRefresh}
          onClose={onClose}
        />
      }
      tabs={tabConfig}
      defaultTab="sources"
    />
  );
}
