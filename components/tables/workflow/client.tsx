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
import { useToast } from '@/components/ui/use-toast';
import { columns } from './columns';
import { Workflow } from '@/constants/deploy';

interface Props {
  workflows: Workflow[];
}

export function WorkflowTable({ workflows }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const handleClick = (workflow: Workflow) => {
    if (workflow.data) {
      router.push(`/dashboard/workflow/${workflow.id}`);
    } else {
      toast({
        title: `${workflow.name} 工作流数据为空`,
        description: '数据不完整，无法编辑，非当前平台编辑创建',
        variant: 'destructive'
      });
    }
  };

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
          <TableRow key={workflow.id} onClick={() => handleClick(workflow)}>
            {columns.map((column) => (
              <TableCell key={column.accessorKey}>
                {column.cell
                  ? column.cell({ row: { original: workflow } })
                  : String(workflow[column.accessorKey as keyof Workflow])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
