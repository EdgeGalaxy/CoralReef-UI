'use client';
import { useState, useEffect } from 'react';
import { SourceDataModel, DeploymentDataModel } from '@/constants/depoy';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, Edit } from 'lucide-react';
import { Sidebar } from './_sidebar';
import { DeploymentTable } from '@/components/tables/deployment/client';

interface Props {
  source: SourceDataModel;
  onClose: () => void;
}

function SourceDetail({ source }: { source: SourceDataModel }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Source name</span>
          <span className="font-medium">{source.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Source type</span>
          <span className="font-medium">{source.sourceType}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Device</span>
          <span className="font-medium">{source.deviceId}</span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button variant="outline" size="sm" className="text-xs">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
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
      value: 'snapshots',
      label: 'Snapshots',
      content: <div>Snapshots content for this source</div>
    },
    {
      value: 'deployments',
      label: 'Deployments',
      content: (
        <DeploymentTable
          deployments={deployments}
          onSelectDeployment={(deployment: DeploymentDataModel) => {}}
        />
      )
    },
    {
      value: 'events',
      label: 'Events',
      content: <div>Events content for this source</div>
    },
    {
      value: 'settings',
      label: 'Settings',
      content: <div>Settings content for this source</div>
    }
  ];

  return (
    <Sidebar
      title={source.name}
      onClose={onClose}
      detailContent={<SourceDetail source={source} />}
      tabs={tabConfig}
      defaultTab="snapshots"
    />
  );
}
