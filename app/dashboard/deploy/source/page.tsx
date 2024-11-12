'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { SourceDataModel } from '@/constants/deploy';
import { SourceTable } from '@/components/tables/source/client';
import { SourceSidebar } from '@/components/sidebar/source';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateSourceDialog from '@/components/modal/create-source';
import useSWR from 'swr';
import { fetcher, getSelectWorkspaceId } from '@/lib/utils';
import { useParams } from 'next/navigation';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '数据源', link: '/dashboard/deploy/source' }
];

export default function GatewayPage() {
  const [selectedSource, setSelectedSource] = useState<SourceDataModel | null>(
    null
  );
  const params = useParams();
  const workspaceId = (params?.workspaceId as string) || getSelectWorkspaceId();

  const { data: sources, error } = useSWR<SourceDataModel[]>(
    `/api/reef/workspaces/${workspaceId}/cameras`,
    fetcher
  );

  // Handle loading state
  if (!sources) return <div>Loading...</div>;
  // Handle error state
  if (error) return <div>Error loading cameras</div>;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`数据源 (${sources.length})`}
              description="管理数据源"
            />
            <CreateSourceDialog workspaceId={workspaceId} />
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
              onClose={() => setSelectedSource(null)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
