'use client';

import { useState, useEffect } from 'react';
import { DeploymentDataModel } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Sidebar } from './_sidebar';

interface Props {
  deployment: DeploymentDataModel;
  onClose: () => void;
}

function DeploymentDetail({ deployment }: { deployment: DeploymentDataModel }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Device ID</span>
          <span className="font-medium">{deployment.deviceId}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Pipeline ID</span>
          <span className="font-medium">{deployment.pipelineId}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Created At</span>
          <span className="font-medium">
            {new Date(deployment.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button variant="destructive" size="sm" className="text-xs">
          <XCircle className="mr-2 h-4 w-4" />
          {deployment.state === 1 ? 'Running' : 'Stopped'}
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

export function DeploymentSidebar({ deployment, onClose }: Props) {
  const tabConfig = [
    {
      value: 'details',
      label: 'Details',
      content: <div>Deployment details content</div>
    },
    {
      value: 'logs',
      label: 'Logs',
      content: <div>Logs content</div>
    },
    {
      value: 'metrics',
      label: 'Metrics',
      content: <div>Metrics content</div>
    },
    {
      value: 'settings',
      label: 'Settings',
      content: <div>Settings content</div>
    }
  ];

  return (
    <Sidebar
      title={deployment.name}
      onClose={onClose}
      detailContent={<DeploymentDetail deployment={deployment} />}
      tabs={tabConfig}
      defaultTab="details"
    />
  );
}
