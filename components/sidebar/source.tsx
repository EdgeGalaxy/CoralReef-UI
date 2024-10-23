'use client';
import { useState, useEffect } from 'react';
import { SourceDataModel, DeploymentDataModel } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sidebar } from './_sidebar';
import { DeploymentTable } from '@/components/tables/deployment/client';

interface Props {
  source: SourceDataModel;
  onClose: () => void;
}

function SourceDetail({ source }: { source: SourceDataModel }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">数据源名</span>
          <span className="font-medium">{source.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">数据源类型</span>
          <span className="font-medium">{source.sourceType}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">设备名</span>
          <span className="font-medium">{source.deviceId}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">创建时间</span>
          <span className="font-medium">
            {new Date(source.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
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

export function SourceSidebar({ source, onClose }: Props) {
  const [deployments, setDeployments] = useState<DeploymentDataModel[]>([]);

  useEffect(() => {
    // Fetch deployments for this source
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
      value: 'preview',
      label: '预览',
      content: <div>预览内容</div>
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
      value: 'settings',
      label: '设置',
      content: <div>设置内容</div>
    }
  ];

  return (
    <Sidebar
      title={source.name}
      onClose={onClose}
      detailContent={<SourceDetail source={source} />}
      tabs={tabConfig}
      defaultTab="preview"
    />
  );
}
