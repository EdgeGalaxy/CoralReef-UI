'use client';

import { Gateway } from '@/constants/depoy';

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
    header: 'NAME'
  },
  {
    accessorKey: 'deviceType',
    header: 'DEVICE TYPE'
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
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
    header: 'GATEWAY VERSION'
  },
  {
    accessorKey: 'deploymentCount',
    header: 'DEPLOYMENT COUNT'
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED TIME'
  }
];
