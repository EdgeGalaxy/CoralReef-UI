'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BlockTranslationTable } from '@/components/tables/block/client';
import {
  BlockTranslation,
  BlockTranslationCreate,
  Language,
  createBlockTranslation,
  deleteBlockTranslation
} from '@/lib/blocks';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { BlockEditModal } from './block-edit-modal';

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
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockTranslation | null>(
    null
  );
  const [formData, setFormData] = useState<BlockTranslationCreate>({
    language: 'ZH',
    human_friendly_block_name: '',
    block_schema: {},
    manifest_type_identifier: ''
  });
  const api = useAuthApi();

  const handleDelete = async (blockId: string) => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const success = await deleteBlockTranslation(api, blockId);
      if (success) {
        await mutate();
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <BlockTranslationTable
        blocks={blocks}
        onSelectBlock={setEditingBlock}
        onDeleteBlock={handleDelete}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
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
