'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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

interface BlockTranslationsProps {
  blocks: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    items: BlockTranslation[];
  };
  mutate: () => Promise<any>;
  setCurrentPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export function BlockTranslations({
  blocks,
  mutate,
  setCurrentPage,
  setPageSize
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

  // 确保blocks和items存在
  if (!blocks || !blocks.items) {
    return <div className="p-4 text-center text-gray-500">暂无数据</div>;
  }
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

  const handleUpdate = async (
    blockId: string,
    data: BlockTranslationUpdate
  ) => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const result = await updateBlockTranslation(api, blockId, data);
      if (result) {
        await mutate();
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
        await mutate();
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
        await mutate();
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
                        // 如果JSON解析失败，不更新状态
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>区块名称</TableHead>
            <TableHead>语言</TableHead>
            <TableHead>标识符</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.items.map((block) => (
            <TableRow key={block.id}>
              <TableCell>{block.human_friendly_block_name}</TableCell>
              <TableCell>{block.language}</TableCell>
              <TableCell>{block.manifest_type_identifier}</TableCell>
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
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          共 {blocks.total} 条记录
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">每页记录数</p>
            <Select
              value={String(blocks.page_size)}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                setPageSize(newPageSize);
                setCurrentPage(1);
                mutate();
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={blocks.page_size} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            第 {blocks.page} / {blocks.total_pages} 页
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                setCurrentPage(1);
                mutate();
              }}
              disabled={blocks.page <= 1}
            >
              <span className="sr-only">跳转到第一页</span>
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                const newPage = blocks.page - 1;
                setCurrentPage(newPage);
                mutate();
              }}
              disabled={blocks.page <= 1}
            >
              <span className="sr-only">上一页</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                const newPage = blocks.page + 1;
                setCurrentPage(newPage);
                mutate();
              }}
              disabled={blocks.page >= blocks.total_pages}
            >
              <span className="sr-only">下一页</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                const newPage = blocks.total_pages;
                setCurrentPage(newPage);
                mutate();
              }}
              disabled={blocks.page >= blocks.total_pages}
            >
              <span className="sr-only">跳转到最后一页</span>
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
