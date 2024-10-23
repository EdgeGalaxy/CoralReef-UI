'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { columns } from './columns';
import { DeploymentDataModel } from '@/constants/deploy';

interface Props {
  deployments: DeploymentDataModel[];
  onSelectDeployment: (deployment: DeploymentDataModel) => void;
}

export function DeploymentTable({ deployments, onSelectDeployment }: Props) {
  return (
    <Table>
      <TableHeader className="bg-gray-100 shadow-sm">
        <TableRow>
          {columns(onSelectDeployment).map((column) => (
            <TableHead key={column.accessorKey} className="font-semibold">
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {deployments.map((deployment) => (
          <TableRow
            key={deployment.id}
            onClick={() => onSelectDeployment(deployment)}
          >
            {columns(onSelectDeployment).map((column) => (
              <TableCell key={column.accessorKey}>
                {column.cell
                  ? column.cell({ row: { original: deployment } })
                  : deployment[column.accessorKey]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
