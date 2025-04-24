'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BlockTranslation,
  BlockTranslationUpdate,
  Language
} from '@/lib/blocks';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import { handleApiRequest } from '@/lib/error-handle';
import { TranslationForm } from './translation-form';

interface BlockEditModalProps {
  block: BlockTranslation | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
}

export function BlockEditModal({
  block,
  isOpen,
  onClose,
  onUpdate
}: BlockEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BlockTranslationUpdate>({});
  const api = useAuthApi();
  const { toast } = useToast();

  useEffect(() => {
    if (block) {
      setFormData({
        language: block.language,
        human_friendly_block_name: block.human_friendly_block_name,
        block_schema: block.block_schema,
        manifest_type_identifier: block.manifest_type_identifier
      });
    }
  }, [block]);

  const handleUpdate = async () => {
    if (!block) return;
    setIsLoading(true);
    try {
      await handleApiRequest(
        () =>
          api.put(`api/reef/workflows/blocks/${block.id}`, {
            json: formData
          }),
        {
          toast,
          successTitle: '节点更新成功',
          errorTitle: '节点更新失败',
          onSuccess: async () => {
            await onUpdate();
            handleClose();
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  const handlePropertiesChange = (updatedProperties: Record<string, any>) => {
    setFormData((prev) => ({
      ...prev,
      block_schema: {
        ...prev.block_schema,
        properties: updatedProperties
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[800px] flex-col overflow-hidden"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="border-b">
          <DialogTitle>编辑节点</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-6">
            <div>
              <Label>节点名称</Label>
              <Input
                value={formData.human_friendly_block_name ?? ''}
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
                value={formData.language ?? 'zh'}
                onValueChange={(value: Language) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>标识符</Label>
              <Input
                value={formData.manifest_type_identifier ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    manifest_type_identifier: e.target.value
                  })
                }
              />
            </div>
          </div>
          {formData.block_schema?.properties && (
            <TranslationForm
              properties={formData.block_schema.properties}
              onChange={handlePropertiesChange}
            />
          )}
        </div>
        <DialogFooter className="mt-auto border-t px-4 pt-2">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            保存{isLoading && '中...'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
