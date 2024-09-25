'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
}

interface TemplateModalProps {
  templates: WorkflowTemplate[];
  onCreateWorkflow: (templateId: string) => void;
  onCreateNewWorkflow: () => void;
}

export function WorkflowTemplateCreateModal({
  templates,
  onCreateWorkflow,
  onCreateNewWorkflow
}: TemplateModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Workflow</Button>
      </DialogTrigger>
      <DialogContent className="flex h-full w-full flex-col sm:max-h-[60vh] sm:max-w-[70vw]">
        <DialogHeader>
          <DialogTitle>Select a Workflow Template</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => onCreateWorkflow(template.id)}
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
        </div>
        <div className="mt-4 flex justify-center">
          <Button onClick={onCreateNewWorkflow}>Create New Workflow</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
