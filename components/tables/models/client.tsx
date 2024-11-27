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
import { MLModel } from '@/constants/models';

interface Props {
  models: MLModel[];
  onSelectModel: (model: MLModel) => void;
}

export function ModelTable({ models, onSelectModel }: Props) {
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
          {models.map((model) => (
            <TableRow key={model.id} onClick={() => onSelectModel(model)}>
              {columns().map((column) => (
                <TableCell key={column.accessorKey as string}>
                  {column.cell
                    ? column.cell({ row: { original: model } })
                    : String(model[column.accessorKey as keyof MLModel] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
