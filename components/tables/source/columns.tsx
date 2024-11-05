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
    accessorKey: 'sourceType',
    header: '数据源类型'
  },
  {
    accessorKey: 'deviceId',
    header: '设备名'
  },
  {
    accessorKey: 'createdAt',
    header: '创建时间'
  }
];
