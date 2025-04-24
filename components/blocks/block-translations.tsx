'use client';

import { useState } from 'react';
import { BlockTranslationTable } from '@/components/tables/block/client';
import { BlockTranslation } from '@/lib/blocks';
import { BlockEditModal } from './block-edit-modal';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import { handleApiRequest } from '@/lib/error-handle';

interface BlockTranslationsProps {
  blocks: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    items: BlockTranslation[];
  };
  mutate: () => Promise<any>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function BlockTranslations({
  blocks,
  mutate,
  onPageChange,
  onPageSizeChange
}: BlockTranslationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockTranslation | null>(
    null
  );
  const api = useAuthApi();
  const { toast } = useToast();

  const handleToggleStatus = async (id: string, disabled: boolean) => {
    try {
      await handleApiRequest(
        () => api.patch(`api/reef/workflows/blocks/${id}/toggle`),
        {
          toast,
          successTitle: `节点${disabled ? '禁用' : '启用'}成功`,
          errorTitle: `节点${disabled ? '禁用' : '启用'}失败`,
          onSuccess: async () => {
            await mutate();
          }
        }
      );
    } catch (error) {
      console.error('切换节点状态失败:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <BlockTranslationTable
        blocks={blocks}
        onSelectBlock={setEditingBlock}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      <BlockEditModal
        block={editingBlock}
        isOpen={!!editingBlock}
        onClose={() => setEditingBlock(null)}
        onUpdate={mutate}
      />
    </div>
  );
}
