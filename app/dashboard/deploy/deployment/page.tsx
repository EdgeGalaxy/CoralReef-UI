'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DeploymentDataModel } from '@/constants/deploy';
import { DeploymentTable } from '@/components/tables/deployment/client';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DeploymentSidebar } from '@/components/sidebar/deployment';
import useSWR from 'swr';
import { fetcher, getSelectWorkspaceId } from '@/lib/utils';
import { useParams } from 'next/navigation';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '服务', link: '/dashboard/deploy/deployment' }
];

export default function DeploymentPage() {
  const [selectedDeployment, setSelectedDeployment] =
    useState<DeploymentDataModel | null>(null);
  const params = useParams();
  const workspaceId = params?.workspaceId || getSelectWorkspaceId();

  const { data: deployments, error } = useSWR<DeploymentDataModel[]>(
    `/api/reef/workspaces/${workspaceId}/deployments`,
    fetcher
  );

  // Handle loading state
  if (!deployments) return <div>Loading...</div>;
  // Handle error state
  if (error) return <div>Error loading deployments</div>;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`服务 (${deployments.length})`}
              description="管理部署服务"
            />
          </div>
          <Separator className="my-4" />
          <DeploymentTable
            deployments={deployments}
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
