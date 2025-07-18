'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { MLModel } from '@/constants/models';
import { ModelTable } from '@/components/tables/models/client';
import { ModelSidebar } from '@/components/sidebar/models';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateModelDialog from '@/components/modal/create-models';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

import DashboardLoading from '@/app/admin/loading';
import DashboardError from '@/app/admin/error';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '模型管理', link: '/dashboard/ml-models' }
];

export default function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) ||
    session.data?.user.select_workspace_id ||
    '';

  const {
    data: models,
    error,
    mutate
  } = useAuthSWR<MLModel[]>(`/api/reef/workspaces/${workspaceId}/models/`);

  const handleCreateSuccess = async () => {
    await mutate(undefined, { revalidate: true });
  };

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!models) return <DashboardLoading />;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`模型 (${models?.length || 0})`}
              description="管理机器学习模型"
            />
            <CreateModelDialog
              workspaceId={workspaceId}
              onSuccess={handleCreateSuccess}
              models={models}
            />
          </div>
          <Separator className="my-4" />
          <ModelTable
            models={models}
            workspaceId={workspaceId}
            onSelectModel={setSelectedModel}
            onModelsChange={handleCreateSuccess}
          />
          {selectedModel && (
            <ModelSidebar
              model={selectedModel}
              workspaceId={workspaceId}
              onRefresh={handleCreateSuccess}
              onClose={() => setSelectedModel(null)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
