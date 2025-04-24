'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { BlockTranslations } from '@/components/blocks/block-translations';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useAuthSWR, useAuthApi } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { type BlockTranslation } from '@/lib/blocks';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { handleApiRequest } from '@/lib/error-handle';

import DashboardLoading from '../loading';
import DashboardError from '../error';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '区块翻译', link: '/dashboard/blocks' }
];

export default function BlocksPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);
  const api = useAuthApi();
  const { toast } = useToast();

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
  }>(`/api/reef/workflows/blocks?page=${page}&page_size=${pageSize}`);

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!blocks) return <DashboardLoading />;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // 重置到第一页
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await handleApiRequest(
        () =>
          api.post('api/reef/workflows/blocks/sync', {
            json: {
              language: 'zh'
            },
            timeout: 60000 // 设置超时时间为1分钟
          }),
        {
          toast,
          successTitle: '同步成功',
          errorTitle: '同步失败',
          onSuccess: async () => {
            await mutate();
          }
        }
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast({
          title: '同步超时',
          description: '请求超过1分钟未完成，请稍后重试',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div
        className={`relative space-y-4 ${
          isSyncing ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        {isSyncing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/5">
            <div className="flex items-center gap-2 rounded-md bg-white px-4 py-2 shadow">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>正在同步节点...</span>
            </div>
          </div>
        )}
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`节点 (${blocks?.total || 0})`}
              description="管理节点内容"
            />
            <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              同步节点
            </Button>
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
