'use client';

import { useState, useEffect } from 'react';
import { Gateway, SourceDataModel } from '@/constants/deploy';
import { DeploymentDataModel } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Sidebar } from './_sidebar';
import { DeploymentTable } from '../tables/deployment/client';
import { SourceTable } from '../tables/source/client';

interface Props {
  gateway: Gateway;
  onClose: () => void;
}

function GatewayDetail({ gateway }: { gateway: Gateway }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">IP address</span>
          <span className="font-medium">
            {gateway.publicIP || gateway.internalIP || 'NO IP ADDRESS'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Gateway name</span>
          <span className="font-medium">{gateway.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Gateway version</span>
          <span className="font-medium">{gateway.gatewayVersion}</span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button variant="destructive" size="sm" className="text-xs">
          <XCircle className="mr-2 h-4 w-4" />
          {gateway.status === 0 ? 'Offline' : 'Online'}
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <RefreshCw className="mr-2 h-4 w-4" />
          Restart
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
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
      label: 'Sources',
      content: (
        <SourceTable
          sources={sources}
          onSelectSource={(source: SourceDataModel) => {}}
        />
      )
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
      content: <div>Events content</div>
    },
    {
      value: 'hardware',
      label: 'Hardware',
      content: <div>Hardware content</div>
    },
    {
      value: 'settings',
      label: 'Settings',
      content: <div>Settings content</div>
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
