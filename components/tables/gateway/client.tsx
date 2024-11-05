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
import { Gateway } from '@/constants/deploy';

interface Props {
  gateways: Gateway[];
  onSelectGateway: (gateway: Gateway) => void;
}

export function GatewayTable({ gateways, onSelectGateway }: Props) {
  return (
    <>
      <Table>
        <TableHeader className="bg-gray-100 shadow-sm">
          <TableRow>
            {columns().map((column) => (
              <TableHead key={column.accessorKey as string}>
                {column.header as string}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {gateways.map((gateway) => (
            <TableRow
              key={gateway.name}
              onClick={() => onSelectGateway(gateway)}
            >
              {columns().map((column) => (
                <TableCell key={column.accessorKey as string}>
                  {column.cell
                    ? column.cell({ row: { original: gateway } })
                    : gateway[column.accessorKey as keyof Gateway]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
