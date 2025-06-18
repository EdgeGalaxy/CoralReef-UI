'use client';

import { MLModel } from '@/constants/models';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Globe2,
  Lock,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export interface ModelTableMeta {
  onToggleVisibility?: (model: MLModel) => void;
  onDelete?: (model: MLModel) => void;
}

export const columns: ColumnDef<MLModel>[] = [
  {
    accessorKey: 'name',
    header: '模型名称'
  },
  {
    accessorKey: 'model_type',
    header: '模型类型',
    cell: ({ row }) => <span>{row.original.model_type}</span>
  },
  {
    accessorKey: 'task_type',
    header: '任务类型',
    cell: ({ row }) => <span>{row.original.task_type}</span>
  },
  {
    accessorKey: 'platform',
    header: '平台',
    cell: ({ row }) => <span>{row.original.platform}</span>
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
          {isPublic ? '公开' : '私密'}
        </span>
      );
    }
  },
  {
    accessorKey: 'workspace_name',
    header: '工作空间'
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => (
      <span>{new Date(row.original.created_at).toLocaleString()}</span>
    )
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const model = row.original;
      const meta = table.options.meta as unknown as ModelTableMeta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta.onToggleVisibility?.(model);
              }}
            >
              {model.is_public ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>设为私密</span>
                </>
              ) : (
                <>
                  <Globe2 className="mr-2 h-4 w-4" />
                  <span>设为公开</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                meta.onDelete?.(model);
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>删除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
