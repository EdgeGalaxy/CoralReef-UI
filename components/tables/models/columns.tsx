'use client';

import { MLModel } from '@/constants/models';

interface Column {
  accessorKey: keyof MLModel;
  header: string;
  cell?: ({ row }: { row: { original: MLModel } }) => React.ReactNode;
}

export const columns = (): Column[] => [
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
    accessorKey: 'workspace_name',
    header: '工作空间'
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => (
      <span>{new Date(row.original.created_at).toLocaleString()}</span>
    )
  }
];
