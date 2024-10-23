'use client';

import { DeploymentDataModel } from '@/constants/deploy';

interface Column {
  accessorKey: keyof DeploymentDataModel;
  header: string;
  cell?: ({
    row
  }: {
    row: { original: DeploymentDataModel };
  }) => React.ReactNode;
}

export const columns = (
  onSelectDeployment: (deployment: DeploymentDataModel) => void
): Column[] => [
  {
    accessorKey: 'name',
    header: '服务名'
  },
  {
    accessorKey: 'deviceId',
    header: '设备名'
  },
  {
    accessorKey: 'pipelineId',
    header: '工作流'
  },
  {
    accessorKey: 'state',
    header: '状态',
    cell: ({ row }) => (
      <span
        className={`${
          row.original.state === 0
            ? 'text-gray-500'
            : row.original.state === 1
            ? 'text-green-500'
            : 'text-red-500'
        }`}
      >
        {row.original.state === 0
          ? 'Stopped'
          : row.original.state === 1
          ? 'Running'
          : 'Error'}
      </span>
    )
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间'
  }
];
