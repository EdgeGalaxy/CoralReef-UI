'use client';

import { ColumnDef, TableMeta } from '@tanstack/react-table';
import { WorkspaceDetail } from '@/constants/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends unknown> {
    onManageUsers: (workspace: WorkspaceDetail) => void;
    onRemoveUser: (workspaceId: string, userId: string) => void;
    onDelete: (workspaceId: string) => void;
    onUpdate: (workspace: WorkspaceDetail) => void;
  }
}

export const columns: ColumnDef<WorkspaceDetail>[] = [
  {
    accessorKey: 'name',
    header: '工作空间名称'
  },
  {
    accessorKey: 'description',
    header: '描述'
  },
  {
    accessorKey: 'user_count',
    header: '成员数量'
  },
  {
    accessorKey: 'current_user_role',
    header: '当前角色'
  },
  {
    accessorKey: 'created_at',
    header: '创建时间'
  },
  {
    header: '操作',
    cell: ({ row, table }) => {
      const workspace = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const { meta } = table.options;
                if (meta?.onManageUsers) {
                  meta.onManageUsers(workspace);
                }
              }}
            >
              管理成员
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const { meta } = table.options;
                if (meta?.onUpdate) {
                  meta.onUpdate(workspace);
                }
              }}
            >
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const { meta } = table.options;
                if (meta?.onDelete) {
                  meta.onDelete(workspace.id);
                }
              }}
              className="text-red-600"
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
