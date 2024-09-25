'use client';

import { SourceDataModel } from '@/constants/deploy';

interface Column {
  accessorKey: keyof SourceDataModel;
  header: string;
  cell?: ({ row }: { row: { original: SourceDataModel } }) => React.ReactNode;
}

export const columns = (
  onSelectSource: (gateway: SourceDataModel) => void
): Column[] => [
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'sourceType',
    header: 'SOURCE TYPE'
  },
  {
    accessorKey: 'deviceId',
    header: 'DEVICE ID'
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED TIME'
  }
];
