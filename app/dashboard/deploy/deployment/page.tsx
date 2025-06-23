'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DeploymentDataModel } from '@/constants/deploy';
import { DeploymentTable } from '@/components/tables/deployment/client';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { DeploymentSidebar } from '@/components/sidebar/deployment';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { CreateDeploymentModal } from '@/components/modal/create-deployment';

import DashboardLoading from '@/app/dashboard/loading';
import DashboardError from '@/app/dashboard/error';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '服务', link: '/dashboard/deploy/deployment' }
];

export default function DeploymentPage() {
  const [selectedDeployment, setSelectedDeployment] =
    useState<DeploymentDataModel | null>(null);
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) ||
    session.data?.user.select_workspace_id ||
    '';

  const {
    data: deployments,
    error,
    mutate
  } = useAuthSWR<DeploymentDataModel[]>(
    `/api/reef/workspaces/${workspaceId}/deployments`
  );

  const handleCreateSuccess = async () => {
    await mutate(undefined, { revalidate: true });
  };

  // Handle error state
  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  // Handle loading state
  if (!deployments) return <DashboardLoading />;

  return (
    <PageContainer scrollable={true}>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`服务 (${deployments?.length || 0})`}
              description="管理部署服务"
            />
            <CreateDeploymentModal
              workspaceId={workspaceId}
              onSuccess={handleCreateSuccess}
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
              onRefresh={handleCreateSuccess}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
