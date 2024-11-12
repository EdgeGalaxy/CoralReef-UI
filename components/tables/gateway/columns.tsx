'use client';

import { Gateway, GatewayStatus } from '@/constants/deploy';

interface Column {
  accessorKey: keyof Gateway;
  header: string;
  cell?: ({ row }: { row: { original: Gateway } }) => React.ReactNode;
}

export const columns = (): Column[] => [
  {
    accessorKey: 'name',
    header: '网关名'
  },
  {
    accessorKey: 'platform',
    header: '平台'
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => (
      <span
        className={`${
          row.original.status === GatewayStatus.OFFLINE
            ? 'text-red-500'
            : row.original.status === GatewayStatus.ONLINE
            ? 'text-green-500'
            : 'text-yellow-500'
        }`}
      >
        {row.original.status === GatewayStatus.OFFLINE
          ? 'Offline'
          : row.original.status === GatewayStatus.ONLINE
          ? 'Online'
          : 'Error'}
      </span>
    )
  },
  {
    accessorKey: 'version',
    header: '版本'
  },
  {
    accessorKey: 'workspace_name',
    header: '工作空间'
  },
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString()
  }
];
