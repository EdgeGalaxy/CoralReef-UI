'use client';

import { columns } from './columns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { SourceDataModel } from '@/constants/depoy';

interface Props {
  sources: SourceDataModel[];
  onSelectSource: (source: SourceDataModel) => void;
}

export function SourceTable({ sources, onSelectSource }: Props) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns(onSelectSource).map((column) => (
              <TableHead key={column.accessorKey as string}>
                {column.header as string}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.name} onClick={() => onSelectSource(source)}>
              {columns(onSelectSource).map((column) => (
                <TableCell key={column.accessorKey as string}>
                  {column.cell
                    ? column.cell({ row: { original: source } })
                    : source[column.accessorKey as keyof SourceDataModel]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
