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
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';

const formSchema = z.object({
  workflow_id: z.string().min(1, '工作流ID不能为空'),
  project_id: z.string().optional(),
  api_key: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface SyncWorkflowTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SyncWorkflowTemplate({
  isOpen,
  onClose,
  onSuccess
}: SyncWorkflowTemplateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const api = useAuthApi();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workflow_id: '',
      project_id: '',
      api_key: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await handleApiRequest(
        () => api.post('api/reef/workflows/templates/sync', { json: values }),
        {
          toast,
          successTitle: '同步成功',
          errorTitle: '同步失败',
          onSuccess: () => {
            form.reset();
            onClose();
            onSuccess?.();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>从Roboflow同步工作流为模板</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="workflow_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roboflow工作流ID</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入Roboflow工作流ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roboflow项目ID（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入Roboflow项目ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roboflow API Key（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入Roboflow API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                type="button"
              >
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '同步中...' : '同步模板'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
