'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import { RefreshCw } from 'lucide-react';
import { Workflow } from '@/constants/deploy';

const formSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface EditWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: Workflow;
  workspaceId: string | undefined;
  onSuccess: (values: FormValues) => void | Promise<void>;
}

export function EditWorkflowModal({
  isOpen,
  onClose,
  workflow,
  workspaceId,
  onSuccess
}: EditWorkflowModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const api = useAuthApi();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workflow.name,
      description: workflow.description || ''
    }
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.put(
            `api/reef/workspaces/${workspaceId}/workflows/${workflow.id}/rename`,
            {
              json: values
            }
          ),
        {
          toast,
          successTitle: '工作流重命名成功',
          errorTitle: '工作流重命名失败',
          onSuccess: () => {
            onClose();
            onSuccess(values);
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px]"
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
          <DialogTitle>编辑工作流</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>工作流名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入工作流名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea placeholder="输入描述信息" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '更新中...' : '更新工作流'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
