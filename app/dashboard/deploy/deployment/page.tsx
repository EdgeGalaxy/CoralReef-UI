'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { DeploymentDataModel } from '@/constants/deploy';
import { DeploymentTable } from '@/components/tables/deployment/client';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DeploymentSidebar } from '@/components/sidebar/deployment';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '服务', link: '/dashboard/deploy/deployment' }
];

// Mock data
const mockDeployments: DeploymentDataModel[] = [
  {
    id: '1',
    name: 'Deployment 1',
    description: 'Description 1',
    deviceId: 'device1',
    pipelineId: 'pipeline1',
    organizationId: 'org1',
    state: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Deployment 2',
    description: 'Description 2',
    deviceId: 'device2',
    pipelineId: 'pipeline2',
    organizationId: 'org2',
    state: 0,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Deployment 3',
    description: 'Description 3',
    deviceId: 'device3',
    pipelineId: 'pipeline3',
    organizationId: 'org3',
    state: 2,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z'
  }
];

export default function DeploymentPage() {
  const [selectedDeployment, setSelectedDeployment] =
    useState<DeploymentDataModel | null>(null);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`服务 (${mockDeployments.length})`}
              description="管理部署服务"
            />
          </div>
          <Separator className="my-4" />
          <DeploymentTable
            deployments={mockDeployments}
            onSelectDeployment={(deployment: DeploymentDataModel) =>
              setSelectedDeployment(deployment)
            }
          />
          {selectedDeployment && (
            <DeploymentSidebar
              deployment={selectedDeployment}
              onClose={() => setSelectedDeployment(null)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
