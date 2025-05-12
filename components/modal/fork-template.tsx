'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { WorkspaceDetail } from '@/constants/user';
import { PaginationResponse } from '@/constants/template';

const formSchema = z.object({
  workspaceId: z.string().min(1, '请选择工作空间')
});

type FormValues = z.infer<typeof formSchema>;

interface ForkTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  currentWorkspaceId: string;
  onFork: (workspaceId: string) => void;
}

export function ForkTemplateModal({
  isOpen,
  onClose,
  templateName,
  currentWorkspaceId,
  onFork
}: ForkTemplateModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 获取工作空间数据
  const { data: workspacesData } = useAuthSWR<
    PaginationResponse<WorkspaceDetail>
  >('/api/reef/workspaces/me');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: currentWorkspaceId || ''
    }
  });

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      form.reset({
        workspaceId: currentWorkspaceId || ''
      });
    }
  }, [isOpen, form, currentWorkspaceId]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await onFork(values.workspaceId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>复制模板到工作空间</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500">
                模板名称: <span className="text-black">{templateName}</span>
              </p>
            </div>

            <FormField
              control={form.control}
              name="workspaceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>选择目标工作空间</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择工作空间" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workspacesData?.items?.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isLoading ? '处理中...' : '复制模板'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
