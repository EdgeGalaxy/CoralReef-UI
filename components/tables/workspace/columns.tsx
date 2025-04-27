'use client';

import { ColumnDef, TableMeta } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { WorkspaceDetail } from '@/types/workspace';

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends unknown> {
    onManageUsers: (workspace: WorkspaceDetail) => void;
    onRemoveUser: (workspaceId: string, userId: string) => void;
    onDelete: (workspaceId: string) => void;
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const { meta } = table.options;
              if (meta?.onManageUsers) {
                meta.onManageUsers(workspace);
              }
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            管理成员
          </button>
          <button
            onClick={() => {
              const { meta } = table.options;
              if (meta?.onDelete) {
                meta.onDelete(workspace.id);
              }
            }}
            className="text-red-500 hover:text-red-700"
          >
            删除
          </button>
        </div>
      );
    }
  }
];
