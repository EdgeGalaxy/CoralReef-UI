'use client';

import { useState, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { TemplateResponse } from '@/constants/template';
import { columns } from './columns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Pagination } from '@/components/tables/pagination';
import { AlertModal } from '@/components/modal/alert-modal';
import { useToast } from '@/components/ui/use-toast';
import { useAuthApi, useAuthSWR } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PaginationResponse } from '@/constants/template';
import { WorkspaceDetail } from '@/constants/user';
import { WorkflowTemplateTableMeta } from './columns';

// ForkTemplateModal组件内联实现
function ForkTemplateModal({
  isOpen,
  onClose,
  templateName,
  currentWorkspaceId,
  onFork
}: {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  currentWorkspaceId: string;
  onFork: (workspaceId: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  // 获取工作空间数据
  const { data: workspacesData } = useAuthSWR<
    PaginationResponse<WorkspaceDetail>
  >('/api/reef/workspaces/me');

  const formSchema = z.object({
    workspaceId: z.string().min(1, '请选择工作空间')
  });

  type FormValues = z.infer<typeof formSchema>;

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

interface WorkflowTemplateTableProps {
  templates: {
    items: TemplateResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onTemplatesChange: () => void;
}

export function WorkflowTemplateTable({
  templates,
  onPageChange,
  onPageSizeChange,
  onTemplatesChange
}: WorkflowTemplateTableProps) {
  const { toast } = useToast();
  const api = useAuthApi();
  const { data: session } = useSession();
  const workspaceId = session?.user.select_workspace_id;

  // 状态
  const [deletingTemplate, setDeletingTemplate] =
    useState<TemplateResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [forkingTemplate, setForkingTemplate] =
    useState<TemplateResponse | null>(null);
  const [isForkModalOpen, setIsForkModalOpen] = useState(false);

  // 处理可见性切换
  const handleToggleVisibility = async (template: TemplateResponse) => {
    try {
      await handleApiRequest(
        () =>
          api.post(
            `api/reef/workflows/templates/${template.id}/toggle-visibility`
          ),
        {
          toast,
          successTitle: `模板已${template.is_public ? '设为私有' : '设为公开'}`,
          errorTitle: '操作失败',
          onSuccess: () => {
            onTemplatesChange();
          }
        }
      );
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  // 处理删除模板
  const handleDelete = async () => {
    if (!deletingTemplate) return;

    setIsDeleting(true);
    try {
      await handleApiRequest(
        () => api.delete(`api/reef/workflows/templates/${deletingTemplate.id}`),
        {
          toast,
          successTitle: '模板删除成功',
          errorTitle: '模板删除失败',
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            onTemplatesChange();
          }
        }
      );
    } finally {
      setIsDeleting(false);
      setDeletingTemplate(null);
    }
  };

  // 处理复制模板到工作空间
  const handleFork = async (workspaceId: string) => {
    if (!forkingTemplate || !workspaceId) return;

    try {
      await handleApiRequest(
        () =>
          api.post(
            `api/reef/workflows/templates/${forkingTemplate.id}/fork/${workspaceId}`
          ),
        {
          toast,
          successTitle: '模板复制成功',
          errorTitle: '模板复制失败',
          onSuccess: () => {
            setIsForkModalOpen(false);
            onTemplatesChange();
          }
        }
      );
    } finally {
      setForkingTemplate(null);
    }
  };

  const table = useReactTable({
    data: templates.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onToggleVisibility: handleToggleVisibility,
      onDelete: (template: TemplateResponse) => {
        setDeletingTemplate(template);
        setIsDeleteModalOpen(true);
      },
      onFork: (template: TemplateResponse) => {
        setForkingTemplate(template);
        setIsForkModalOpen(true);
      }
    } as WorkflowTemplateTableMeta
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100 shadow-sm">
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={templates.page}
        pageSize={templates.page_size}
        total={templates.total}
        totalPages={templates.total_pages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="确认删除"
        description="确定要删除这个工作流模板吗？此操作不可逆。"
      />

      <ForkTemplateModal
        isOpen={isForkModalOpen}
        onClose={() => setIsForkModalOpen(false)}
        templateName={forkingTemplate?.name || ''}
        currentWorkspaceId={workspaceId || ''}
        onFork={handleFork}
      />
    </div>
  );
}
