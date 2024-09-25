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
    header: 'NAME'
  },
  {
    accessorKey: 'deviceId',
    header: 'DEVICE ID'
  },
  {
    accessorKey: 'pipelineId',
    header: 'PIPELINE ID'
  },
  {
    accessorKey: 'state',
    header: 'STATE',
    cell: ({ row }) => (
      <span
        className={`${
          row.original.state === 1 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {row.original.state === 1 ? 'Running' : 'Stopped'}
      </span>
    )
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED TIME'
  }
];
