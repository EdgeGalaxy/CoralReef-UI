'use client';

import { useState, useEffect } from 'react';
import { Gateway, SourceDataModel } from '@/constants/deploy';
import { DeploymentDataModel } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

import { Sidebar } from './_sidebar';
import { DeploymentTable } from '../tables/deployment/client';
import { SourceTable } from '../tables/source/client';
import { EditableField } from './components/editable-field';

interface Props {
  gateway: Gateway;
  onClose: () => void;
}

function GatewayDetail({ gateway }: { gateway: Gateway }) {
  const handleUpdate = async (field: keyof Gateway, newValue: string) => {
    // Implement the API call to update the gateway
    console.log(`Updating ${field} to ${newValue}`);
    // Example: await updateGateway(gateway.id, { [field]: newValue });
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">网关地址</span>
          <span className="font-medium">
            {gateway.publicIP || gateway.internalIP || '未设置'}
          </span>
        </div>
        <EditableField
          value={gateway.name}
          label="网关名"
          onUpdate={(newValue) => handleUpdate('name', newValue)}
        />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">网关版本</span>
          <span className="font-medium">{gateway.gatewayVersion}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">最后更新时间</span>
          <span className="font-medium">
            {new Date(gateway.updatedAt).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button
          size="sm"
          className={`text-xs ${
            gateway.status === 0
              ? 'bg-red-500 hover:bg-red-500'
              : 'bg-green-500 hover:bg-green-500'
          }`}
        >
          {gateway.status === 0 ? (
            <Icons.offline className="mr-2 h-4 w-4" />
          ) : (
            <Icons.online className="mr-2 h-4 w-4" />
          )}
          {gateway.status === 0 ? '离线' : '在线'}
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.refreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>
    </div>
  );
}

export function GatewaySidebar({ gateway, onClose }: Props) {
  const [sources, setSources] = useState<SourceDataModel[]>([]);
  const [deployments, setDeployments] = useState<DeploymentDataModel[]>([]);

  useEffect(() => {
    setSources([
      {
        name: 'Source 1',
        sourceType: 1,
        link: 'http://192.168.1.1',
        organizationId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Source 2',
        sourceType: 1,
        link: 'http://192.168.1.2',
        organizationId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);

    setDeployments([
      {
        id: '1',
        name: 'Deployment 1',
        deviceId: 'device1',
        pipelineId: 'pipeline1',
        state: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        description: 'Description 1',
        organizationId: 'organization1'
      },
      {
        id: '2',
        name: 'Deployment 2',
        deviceId: 'device2',
        pipelineId: 'pipeline2',
        state: 0,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        description: 'Description 2',
        organizationId: 'organization2'
      }
    ]);
  }, []);

  const tabConfig = [
    {
      value: 'sources',
      label: '关联数据源',
      content: (
        <SourceTable
          sources={sources}
          onSelectSource={(source: SourceDataModel) => {}}
        />
      )
    },
    {
      value: 'deployments',
      label: '关联服务',
      content: (
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
      detailContent={<GatewayDetail gateway={gateway} />}
      tabs={tabConfig}
      defaultTab="sources"
    />
  );
}
