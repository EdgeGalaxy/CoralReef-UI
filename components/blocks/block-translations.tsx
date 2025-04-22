'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import { toast } from '@/components/ui/use-toast';
import {
  createBlockTranslation,
  getBlockTranslations,
  updateBlockTranslation,
  deleteBlockTranslation,
  syncBlockTranslations,
  type BlockTranslation,
  type BlockTranslationCreate,
  type BlockTranslationUpdate
} from '@/lib/blocks';
import { useAuthApi } from '@/components/hooks/useAuthReq';

export function BlockTranslations() {
  const { data: session } = useSession();
  const [blocks, setBlocks] = useState<BlockTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockTranslation | null>(
    null
  );
  const [formData, setFormData] = useState<BlockTranslationCreate>({
    name: '',
    content: '',
    language: 'en'
  });

  const api = useAuthApi();

  const loadBlocks = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const data = await getBlockTranslations(api);
      if (data) {
        setBlocks(data);
      }
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, []);

  const handleCreate = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const result = await createBlockTranslation(api, formData);
      if (result) {
        setBlocks([...blocks, result]);
        setIsDialogOpen(false);
        setFormData({ name: '', content: '', language: 'en' });
      }
    } catch (error) {
      console.error('Failed to create block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    blockId: string,
    data: BlockTranslationUpdate
  ) => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const result = await updateBlockTranslation(api, blockId, data);
      if (result) {
        setBlocks(
          blocks.map((block) => (block.id === blockId ? result : block))
        );
      }
    } catch (error) {
      console.error('Failed to update block:', error);
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
        setBlocks(blocks.filter((block) => block.id !== blockId));
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const result = await syncBlockTranslations(api);
      if (result) {
        setBlocks(result);
        toast({
          title: '同步成功',
          description: '区块翻译已成功同步'
        });
      }
    } catch (error) {
      console.error('Failed to sync blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">区块翻译管理</h2>
        <div className="space-x-2">
          <Button onClick={handleSync} disabled={isLoading}>
            同步{isLoading && '中...'}
          </Button>
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
                  <Label>名称</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>语言</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>内容</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>语言</TableHead>
            <TableHead>内容</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.map((block) => (
            <TableRow key={block.id}>
              <TableCell>{block.name}</TableCell>
              <TableCell>{block.language}</TableCell>
              <TableCell>{block.content}</TableCell>
              <TableCell>{block.disabled ? '禁用' : '启用'}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => {
                      setEditingBlock(block);
                      setIsDialogOpen(true);
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isLoading}
                    onClick={() => handleDelete(block.id)}
                  >
                    删除{isLoading && '中...'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
