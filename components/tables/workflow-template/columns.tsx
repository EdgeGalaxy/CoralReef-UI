'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Eye, EyeOff, Copy, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateResponse } from '@/constants/template';

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends unknown> {
    onToggleVisibility?: (template: TemplateResponse) => void;
    onFork?: (template: TemplateResponse) => void;
    onDelete?: (template: TemplateResponse) => void;
  }
}

export interface WorkflowTemplateTableMeta {
  onToggleVisibility?: (template: TemplateResponse) => void;
  onFork?: (template: TemplateResponse) => void;
  onDelete?: (template: TemplateResponse) => void;
  onManageUsers?: (workspace: any) => void;
  onRemoveUser?: (workspaceId: string, userId: string) => void;
}

export const columns: ColumnDef<TemplateResponse>[] = [
  {
    accessorKey: 'name',
    header: '模板名称'
  },
  {
    accessorKey: 'description',
    header: '描述'
  },
  {
    accessorKey: 'is_public',
    header: '可见性',
    cell: ({ row }) => {
      const isPublic = row.original.is_public;
      return (
        <span
          className={`flex items-center ${
            isPublic ? 'text-green-500' : 'text-orange-500'
          }`}
        >
          {isPublic ? (
            <Eye className="mr-1 h-4 w-4" />
          ) : (
            <EyeOff className="mr-1 h-4 w-4" />
          )}
          {isPublic ? '公开' : '私有'}
        </span>
      );
    }
  },
  {
    accessorKey: 'usage_count',
    header: '使用次数'
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleString();
    }
  },
  {
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => {
      return new Date(row.original.updated_at).toLocaleString();
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const template = row.original;
      const meta = table.options.meta as unknown as WorkflowTemplateTableMeta;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (meta?.onToggleVisibility) {
                meta.onToggleVisibility(template);
              }
            }}
            title={template.is_public ? '设为私有' : '设为公开'}
          >
            {template.is_public ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (meta?.onFork) {
                meta.onFork(template);
              }
            }}
            title="复制到工作空间"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => {
              if (meta?.onDelete) {
                meta.onDelete(template);
              }
            }}
            title="删除模板"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];
