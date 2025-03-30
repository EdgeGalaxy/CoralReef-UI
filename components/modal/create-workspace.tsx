'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { RefreshCw } from 'lucide-react';
import {
  workspaceFormSchema,
  type WorkspaceFormValues
} from '@/constants/workspace';

export default function CreateWorkspaceDialog({
  isOpen,
  onSuccess,
  onClose
}: {
  isOpen: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const api = useAuthApi();
  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: '',
      description: '',
      max_users: 10
    }
  });

  // 重置表单状态
  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
    }

    // 清理函数
    return () => {
      document.body.style.pointerEvents = '';
      form.reset();
    };
  }, [isOpen, form]);

  const handleClose = React.useCallback(() => {
    form.reset();
    setIsLoading(false);
    // 确保在关闭对话框时重置所有状态
    document.body.style.pointerEvents = '';
    onClose?.();
  }, [form, onClose]);

  async function onSubmit(values: WorkspaceFormValues) {
    setIsLoading(true);
    try {
      await handleApiRequest(
        () => api.post('api/reef/workspaces/', { json: values }),
        {
          toast,
          successTitle: '创建成功',
          errorTitle: '创建失败',
          onSuccess: () => {
            handleClose();
            onSuccess?.();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        )}
        <DialogHeader>
          <DialogTitle>创建工作空间</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>工作空间名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入工作空间名称" {...field} />
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
                    <Input placeholder="输入描述信息" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_users"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大用户数</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="输入最大用户数"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '创建中...' : '创建工作空间'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
