'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { BlockTranslations } from '@/components/blocks/block-translations';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

import DashboardLoading from '../loading';
import DashboardError from '../error';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '区块翻译', link: '/dashboard/blocks' }
];

export default function BlocksPage() {
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) ||
    session.data?.user.select_workspace_id ||
    '';

  const {
    data: blocks,
    error,
    mutate
  } = useAuthSWR<any[]>(`/api/reef/blocks/`);

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!blocks) return <DashboardLoading />;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`区块翻译 (${blocks?.length || 0})`}
              description="管理区块翻译内容"
            />
          </div>
          <Separator className="my-4" />
          <BlockTranslations />
        </div>
      </div>
    </PageContainer>
  );
}
