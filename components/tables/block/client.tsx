import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BlockTranslation } from '@/lib/blocks';
import { columns } from './columns';
import { Pagination } from '../pagination';

interface BlockTranslationTableProps {
  blocks: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    items: BlockTranslation[];
  };
  onSelectBlock: (block: BlockTranslation) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

export function BlockTranslationTable({
  blocks,
  onSelectBlock,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}: BlockTranslationTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100 shadow-sm">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.items.length > 0 ? (
              blocks.items.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.key === 'actions' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectBlock(item)}
                            disabled={isLoading}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            编辑
                          </button>
                        </div>
                      ) : column.cell ? (
                        column.cell(item)
                      ) : (
                        String(item[column.key as keyof BlockTranslation] || '')
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Pagination
        total={blocks.total}
        page={blocks.page}
        pageSize={blocks.page_size}
        totalPages={blocks.total_pages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
