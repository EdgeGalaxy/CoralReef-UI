'use client';

import { Workflow } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface Column {
  accessorKey: keyof Workflow | 'actions';
  header: string;
  cell?: ({ row }: { row: { original: Workflow } }) => React.ReactNode;
}

export const columns: Column[] = [
  {
    accessorKey: 'name',
    header: '工作流名'
  },
  {
    accessorKey: 'description',
    header: '描述'
  },
  {
    accessorKey: 'created_at',
    header: '创建时间'
  },
  {
    accessorKey: 'updated_at',
    header: '更新时间'
  },
  {
    accessorKey: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const workflow = row.original;

      return (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            data-action="edit"
            data-workflow-id={workflow.id}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            data-action="delete"
            data-workflow-id={workflow.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];
