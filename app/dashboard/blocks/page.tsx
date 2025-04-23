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
import { type BlockTranslation } from '@/lib/blocks';

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: blocks,
    error,
    mutate
  } = useAuthSWR<{
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    items: BlockTranslation[];
  }>(`/api/reef/blocks?page=${page}&page_size=${pageSize}`);

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!blocks) return <DashboardLoading />;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 重置到第一页
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`区块翻译 (${blocks?.total || 0})`}
              description="管理区块翻译内容"
            />
          </div>
          <Separator className="my-4" />
          <BlockTranslations
            blocks={blocks}
            mutate={mutate}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </PageContainer>
  );
}
