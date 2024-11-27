'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';

import { Workflow } from '@/constants/deploy';

interface TemplateModalProps {
  templates: Workflow[];
  onCreateWorkflow: (templateId: string) => void;
  onCreateNewWorkflow: () => void;
}

export function WorkflowTemplateCreateModal({
  templates,
  onCreateWorkflow,
  onCreateNewWorkflow
}: TemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCreateWorkflow = async (templateId: string) => {
    setIsLoading(true);
    try {
      await onCreateWorkflow(templateId);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewWorkflow = async () => {
    setIsLoading(true);
    try {
      await onCreateNewWorkflow();
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>创建工作流</Button>
      </DialogTrigger>
      <DialogContent
        className="flex h-full w-full flex-col sm:max-h-[60vh] sm:max-w-[70vw]"
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        )}
        <DialogHeader>
          <DialogTitle>选择工作流模板</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleCreateNewWorkflow}>创建新工作流</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
