'use client';

import { ColumnDef, TableMeta } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Workspace, WorkspaceDetail } from '@/types/workspace';

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends unknown> {
    onManageUsers: (workspace: Workspace) => void;
    onDelete: (id: string) => void;
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
    header: '操作',
    cell: ({ row, table }) => {
      const workspace = row.original;
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              const { meta } = table.options;
              if (meta?.onManageUsers) {
                meta.onManageUsers(workspace);
              }
            }}
          >
            管理成员
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              const { meta } = table.options;
              if (meta?.onDelete) {
                meta.onDelete(workspace.id);
              }
            }}
          >
            删除
          </Button>
        </div>
      );
    }
  }
];
