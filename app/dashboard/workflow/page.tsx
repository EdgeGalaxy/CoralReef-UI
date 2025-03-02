'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { WorkflowTable } from '@/components/tables/workflow/client';
import { Workflow } from '@/constants/deploy';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { WorkflowTemplateCreateModal } from '@/components/modal/create-workflow';
import { useParams } from 'next/navigation';
import { useAuthSWR } from '@/hooks/useAuthReq';
import { useSession } from 'next-auth/react';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '工作流', link: '/dashboard/workflow' }
];

const WorkflowListPage = () => {
  const [templates, setTemplates] = useState<Workflow[]>([]);
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) || session.data?.user.select_workspace_id;

  const {
    data: workflows,
    error,
    mutate: refreshWorkflows
  } = useAuthSWR<Workflow[]>(`/api/reef/workspaces/${workspaceId}/workflows`);

  // 处理加载状态
  if (!workflows) return <div>Loading...</div>;
  // 处理错误状态
  if (error) return <div>Error loading workflows</div>;

  const handleCreateTemplateWorkflow = (templateId: string) => {
    console.log(`Creating workflow from template ${templateId}`);
    window.location.href = `/dashboard/workflow/${templateId}`;
  };

  const handleCreateNewWorkflow = () => {
    window.location.href = `/dashboard/workflow/new`;
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`工作流 (${workflows.length})`}
              description="管理工作流"
            />
            <WorkflowTemplateCreateModal
              templates={templates}
              onCreateWorkflow={handleCreateTemplateWorkflow}
              onCreateNewWorkflow={handleCreateNewWorkflow}
            />
          </div>
          <Separator className="my-4" />
          <WorkflowTable
            workflows={workflows}
            workspaceId={workspaceId}
            onWorkflowsChange={refreshWorkflows}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkflowListPage;
