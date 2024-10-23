'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { columns } from './columns';
import { Workflow } from '@/constants/deploy';

interface Props {
  workflows: Workflow[];
}

export function WorkflowTable({ workflows }: Props) {
  const router = useRouter();
  return (
    <Table>
      <TableHeader className="bg-gray-100 shadow-sm">
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.accessorKey}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {workflows.map((workflow) => (
          <TableRow
            key={workflow.id}
            onClick={() => router.push(`/dashboard/workflow/${workflow.id}`)}
          >
            {columns.map((column) => (
              <TableCell key={column.accessorKey}>
                {column.cell
                  ? column.cell({ row: { original: workflow } })
                  : workflow[column.accessorKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
