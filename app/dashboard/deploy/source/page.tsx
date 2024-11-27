'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { SourceDataModel, Gateway } from '@/constants/deploy';
import { SourceTable } from '@/components/tables/source/client';
import { SourceSidebar } from '@/components/sidebar/source';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateSourceDialog from '@/components/modal/create-source';
import { useAuthSWR, useAuthApi } from '@/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '数据源', link: '/dashboard/deploy/source' }
];

export default function SourcePage() {
  const [selectedSource, setSelectedSource] = useState<SourceDataModel | null>(
    null
  );
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) ||
    session.data?.user.select_workspace_id ||
    '';

  const { data: gateways, error: gatewaysError } = useAuthSWR<Gateway[]>(
    `/api/reef/workspaces/${workspaceId}/gateways`
  );

  const {
    data: sources,
    error,
    mutate
  } = useAuthSWR<SourceDataModel[]>(
    `/api/reef/workspaces/${workspaceId}/cameras`
  );

  const handleCreateSuccess = async () => {
    await mutate(undefined, { revalidate: true });
  };

  // Handle loading state
  if (!sources) return <div>Loading...</div>;
  // Handle error state
  if (error) return <div>Error loading cameras</div>;
  if (gatewaysError) return <div>Error loading gateways</div>;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`数据源 (${sources?.length || 0})`}
              description="管理数据源"
            />
            <CreateSourceDialog
              workspaceId={workspaceId}
              gateways={gateways || []}
              onSuccess={handleCreateSuccess}
            />
          </div>
          <Separator className="my-4" />
          <SourceTable
            sources={sources}
            onSelectSource={(source: SourceDataModel) =>
              setSelectedSource(source)
            }
          />
          {selectedSource && (
            <SourceSidebar
              source={selectedSource}
              onRefresh={handleCreateSuccess}
              onClose={() => setSelectedSource(null)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
