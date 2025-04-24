import { BlockTranslation } from '@/lib/blocks';

export interface Column {
  key: string;
  header: string;
  cell?: (item: BlockTranslation) => React.ReactNode;
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
    key: 'disabled',
    header: '状态',
    cell: (item: BlockTranslation) => (
      <span>{item.disabled ? '禁用' : '启用'}</span>
    )
  },
  {
    key: 'actions',
    header: '操作'
  }
];
