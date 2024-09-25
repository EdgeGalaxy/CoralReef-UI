'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { WorkflowTable } from '@/components/tables/workflow/client';
import { Workflow } from '@/constants/deploy';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { WorkflowTemplateCreateModal } from '@/components/modal/create-workflow';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
}

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Workflow', link: '/dashboard/workflow' }
];

const WorkflowListPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);

  useEffect(() => {
    // Mock data for workflows
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'Workflow 1',
        description: 'Description for Workflow 1',
        createdAt: '2023-05-01T00:00:00Z',
        updatedAt: '2023-05-02T00:00:00Z'
      },
      {
        id: '2',
        name: 'Workflow 2',
        description: 'Description for Workflow 2',
        createdAt: '2023-05-03T00:00:00Z',
        updatedAt: '2023-05-04T00:00:00Z'
      }
    ];
    setWorkflows(mockWorkflows);

    // Mock data for workflow templates
    const mockTemplates = [
      {
        id: 'template1',
        name: 'Template 1',
        description: 'Description for Template 1'
      },
      {
        id: 'template2',
        name: 'Template 2',
        description: 'Description for Template 2'
      }
    ];
    setTemplates(mockTemplates);
  }, []);

  const handleCreateTemplateWorkflow = (templateId: string) => {
    console.log(`Creating workflow from template ${templateId}`);
    window.location.href = `/dashboard/workflow/${templateId}`;
  };

  const handleCreateNewWorkflow = () => {
    const newWorkflowId = Math.random().toString(36).substr(2, 9);
    console.log(`Creating new workflow with ID: ${newWorkflowId}`);
    window.location.href = `/dashboard/workflow/${newWorkflowId}`;
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`Workflows (${workflows.length})`}
              description="Manage your workflows"
            />
            <WorkflowTemplateCreateModal
              templates={templates}
              onCreateWorkflow={handleCreateTemplateWorkflow}
              onCreateNewWorkflow={handleCreateNewWorkflow}
            />
          </div>
          <Separator className="my-4" />
          <WorkflowTable workflows={workflows} />
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkflowListPage;
