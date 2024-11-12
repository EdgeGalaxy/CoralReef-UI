'use client';

import { DeploymentDataModel, OperationStatus } from '@/constants/deploy';

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
    cell: ({ row }) => (
      <span
        className={`${
          row.original.running_status === OperationStatus.STOPPED
            ? 'text-gray-500'
            : row.original.running_status === OperationStatus.RUNNING
            ? 'text-green-500'
            : 'text-red-500'
        }`}
      >
        {row.original.running_status === OperationStatus.STOPPED
          ? '停止'
          : row.original.running_status === OperationStatus.RUNNING
          ? '运行中'
          : '错误'}
      </span>
    )
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString()
  }
];
