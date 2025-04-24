import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { BlockTranslation } from '@/lib/blocks';

export const columns: ColumnDef<BlockTranslation>[] = [
  {
    accessorKey: 'human_friendly_block_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          节点名称
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  // {
  //   accessorKey: 'language',
  //   header: ({ column }) => {
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         语言
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     );
  //   }
  // },
  {
    accessorKey: 'manifest_type_identifier',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          标识符
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    }
  },
  {
    accessorKey: 'disabled',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          状态
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const disabled = row.getValue('disabled') as boolean;
      return <span>{disabled ? '禁用' : '启用'}</span>;
    }
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row, table }) => {
      const block = row.original;
      const meta = table.options.meta as {
        onSelectBlock: (block: BlockTranslation) => void;
        onDeleteBlock: (blockId: string) => void;
        isLoading?: boolean;
      };

      return (
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={meta.isLoading}
            onClick={() => meta.onSelectBlock(block)}
          >
            编辑
          </Button>
          <Button
            variant="destructive"
            disabled={meta.isLoading}
            onClick={() => meta.onDeleteBlock(block.id)}
          >
            删除{meta.isLoading && '中...'}
          </Button>
        </div>
      );
    }
  }
];
