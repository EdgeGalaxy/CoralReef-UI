'use client';

import { Workflow } from '@/constants/deploy';

interface Column {
  accessorKey: keyof Workflow;
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
    accessorKey: 'createdAt',
    header: '创建时间'
  },
  {
    accessorKey: 'updatedAt',
    header: '更新时间'
  }
];
