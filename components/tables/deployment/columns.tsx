'use client';

import {
  DeploymentDataModel,
  OperationStatus,
  getStatusConfig
} from '@/constants/deploy';

interface Column {
  accessorKey: keyof DeploymentDataModel;
  header: string;
  cell?: ({
    row
  }: {
    row: { original: DeploymentDataModel };
  }) => React.ReactNode;
}

export const columns = (): Column[] => [
  {
    accessorKey: 'name',
    header: '服务名'
  },
  {
    accessorKey: 'gateway_name',
    header: '网关'
  },
  {
    accessorKey: 'workflow_name',
    header: '工作流'
  },
  {
    accessorKey: 'running_status',
    header: '状态',
    cell: ({ row }) => {
      const status = getStatusConfig(row.original.running_status);
      return <span className={`text-${status.color}-500`}>{status.text}</span>;
    }
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString()
  }
];
