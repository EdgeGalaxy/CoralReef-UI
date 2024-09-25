'use client';

import { Workflow } from '@/constants/deploy';

interface Column {
  accessorKey: keyof Workflow;
  header: string;
  cell?: ({ row }: { row: { original: Workflow } }) => React.ReactNode;
}

export const columns: Column[] = [
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION'
  },
  {
    accessorKey: 'createdAt',
    header: 'CREATED TIME'
  },
  {
    accessorKey: 'updatedAt',
    header: 'UPDATED TIME'
  }
];
