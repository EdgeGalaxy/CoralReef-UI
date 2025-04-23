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

  const handleCreate = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const result = await createBlockTranslation(api, formData);
      if (result) {
        await mutate();
        setIsDialogOpen(false);
        setFormData({
          language: 'ZH',
          human_friendly_block_name: '',
          block_schema: {},
          manifest_type_identifier: ''
        });
      }
    } catch (error) {
      console.error('Failed to create block:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">区块翻译管理</h2>
        <div className="space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLoading}>创建新翻译</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新翻译</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>区块名称</Label>
                  <Input
                    value={formData.human_friendly_block_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        human_friendly_block_name: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <Label>语言</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: Language) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN">English</SelectItem>
                      <SelectItem value="ZH">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>标识符</Label>
                  <Input
                    value={formData.manifest_type_identifier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manifest_type_identifier: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Schema</Label>
                  <Textarea
                    value={JSON.stringify(formData.block_schema, null, 2)}
                    onChange={(e) => {
                      try {
                        const schema = JSON.parse(e.target.value);
                        setFormData({ ...formData, block_schema: schema });
                      } catch (error) {
                        console.error('Invalid JSON schema');
                      }
                    }}
                    placeholder="请输入有效的 JSON"
                  />
                </div>
                <Button onClick={handleCreate} disabled={isLoading}>
                  创建{isLoading && '中...'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <BlockTranslationTable
        blocks={blocks}
        onSelectBlock={setEditingBlock}
        onDeleteBlock={handleDelete}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />
    </div>
  );
}
