import { BlockTranslation } from '@/lib/blocks';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

export interface Column {
  key: string;
  header: string;
  cell?: (
    item: BlockTranslation,
    onToggle?: (id: string, disabled: boolean) => Promise<void>
  ) => React.ReactNode;
}

export const columns: Column[] = [
  {
    key: 'human_friendly_block_name',
    header: '节点名称'
  },
  {
    key: 'manifest_type_identifier',
    header: '标识符'
  },
  {
    key: 'sync_at',
    header: '同步时间',
    cell: (item: BlockTranslation) => (
      <span>
        {item.sync_at
          ? format(new Date(item.sync_at), 'yyyy-MM-dd HH:mm:ss')
          : '-'}
      </span>
    )
  },
  {
    key: 'disabled',
    header: '状态',
    cell: (
      item: BlockTranslation,
      onToggle?: (id: string, disabled: boolean) => Promise<void>
    ) => (
      <div className="flex items-center space-x-2">
        <Switch
          checked={!item.disabled}
          onCheckedChange={async (checked) => {
            if (onToggle) {
              await onToggle(item.id, !checked);
            }
          }}
        />
        <span className={item.disabled ? 'text-red-500' : 'text-green-500'}>
          {item.disabled ? '禁用' : '启用'}
        </span>
      </div>
    )
  },
  {
    key: 'actions',
    header: '操作'
  }
];
