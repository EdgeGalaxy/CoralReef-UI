'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface Workflow {
  id: string;
  name: string;
  description: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
}

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Design', link: '/dashboard/design' }
];

const WorkflowListPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    // Mock data for workflows
    const mockWorkflows = [
      {
        id: '1',
        name: 'Workflow 1',
        description: 'Description for Workflow 1'
      },
      { id: '2', name: 'Workflow 2', description: 'Description for Workflow 2' }
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

  const handleCreateWorkflow = (templateId: string) => {
    // TODO: Implement workflow creation logic
    console.log(`Creating workflow from template ${templateId}`);
    setIsCreateModalOpen(false);
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Workflows</h1>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button>Create Workflow</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Select a Workflow Template</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer transition-shadow hover:shadow-lg"
                      onClick={() => handleCreateWorkflow(template.id)}
                    >
                      <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    // Logic to create a new workflow
                    const newWorkflowId = Math.random()
                      .toString(36)
                      .substr(2, 9); // Generate a random ID
                    console.log(
                      `Creating new workflow with ID: ${newWorkflowId}`
                    );
                    // Redirect to the new workflow page
                    window.location.href = `/dashboard/design/${newWorkflowId}`;
                  }}
                >
                  Create New Workflow
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Link href={`/dashboard/design/${workflow.id}`} key={workflow.id}>
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>{workflow.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{workflow.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default WorkflowListPage;
