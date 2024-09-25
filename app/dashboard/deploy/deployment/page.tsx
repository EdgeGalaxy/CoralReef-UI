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
  { title: 'Deploy', link: '/dashboard/deploy/deployment' },
  { title: 'Deployment', link: '/dashboard/deploy/deployment' }
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
              title={`Deployments (${mockDeployments.length})`}
              description="Manage deployments"
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
