'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { WorkflowTemplateTable } from '@/components/tables/workflow-template/client';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { PaginationResponse, TemplateResponse } from '@/constants/template';
import { useSession } from 'next-auth/react';
import SyncWorkflowTemplate from '@/components/modal/sync-workflow-template';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import DashboardLoading from '@/app/admin/loading';
import DashboardError from '@/app/admin/error';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '工作流模板', link: '/dashboard/workflow-template' }
];

const WorkflowTemplatePage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const session = useSession();

  const {
    data: templates,
    error,
    mutate: refreshTemplates
  } = useAuthSWR<PaginationResponse<TemplateResponse>>(
    `/api/reef/workflows/templates?page=${page}&page_size=${pageSize}`
  );

  // 处理错误状态
  if (error)
    return <DashboardError error={error} reset={() => refreshTemplates()} />;
  // 处理加载状态
  if (!templates) return <DashboardLoading />;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`工作流模板 (${templates.total})`}
              description="管理工作流模板"
            />
            <Button onClick={() => setIsSyncModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              同步模板
            </Button>
          </div>
          <Separator className="my-4" />
          <WorkflowTemplateTable
            templates={templates}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onTemplatesChange={refreshTemplates}
          />
        </div>
      </div>

      <SyncWorkflowTemplate
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={refreshTemplates}
      />
    </PageContainer>
  );
};

export default WorkflowTemplatePage;
