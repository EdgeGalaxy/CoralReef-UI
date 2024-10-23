'use client';

import { Gateway } from '@/constants/deploy';

interface Column {
  accessorKey: keyof Gateway;
  header: string;
  cell?: ({ row }: { row: { original: Gateway } }) => React.ReactNode;
}

export const columns = (
  onSelectGateway: (gateway: Gateway) => void
): Column[] => [
  {
    accessorKey: 'name',
    header: '网关名'
  },
  {
    accessorKey: 'deviceType',
    header: '设备类型'
  },
  {
    accessorKey: 'status',
    header: '状态',
    cell: ({ row }) => (
      <span
        className={`${
          row.original.status === 0 ? 'text-red-500' : 'text-green-500'
        }`}
      >
        {row.original.status === 0 ? 'Offline' : 'Online'}
      </span>
    )
  },
  {
    accessorKey: 'gatewayVersion',
    header: '网关版本'
  },
  {
    accessorKey: 'deploymentCount',
    header: '部署服务数'
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间'
  }
];
