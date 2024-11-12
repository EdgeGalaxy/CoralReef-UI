'use client';

import { SourceDataModel } from '@/constants/deploy';

interface Column {
  accessorKey: keyof SourceDataModel;
  header: string;
  cell?: ({ row }: { row: { original: SourceDataModel } }) => React.ReactNode;
}

export const columns = (): Column[] => [
  {
    accessorKey: 'name',
    header: '数据源名'
  },
  {
    accessorKey: 'type',
    header: '类型',
    cell: ({ row }) => <span>{row.original.type}</span>
  },
  {
    accessorKey: 'path',
    header: '路径'
  },
  {
    accessorKey: 'gateway_name',
    header: '网关'
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
