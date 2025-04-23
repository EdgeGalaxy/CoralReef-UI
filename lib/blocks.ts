import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from './error-handle';
import { toast } from '@/components/ui/use-toast';

export type Language = 'ZH' | 'EN';

export interface BlockTranslation {
  id: string;
  language: Language;
  human_friendly_block_name: string;
  block_schema: Record<string, any>;
  manifest_type_identifier: string;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockTranslationCreate {
  language: Language;
  human_friendly_block_name: string;
  block_schema: Record<string, any>;
  manifest_type_identifier: string;
}

export interface BlockTranslationUpdate {
  language?: Language;
  human_friendly_block_name?: string;
  block_schema?: Record<string, any>;
  manifest_type_identifier?: string;
  disabled?: boolean;
}

export interface BlockTranslationSync {
  source_url: string;
  language: Language;
}

export async function createBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  data: BlockTranslationCreate
): Promise<BlockTranslation | null> {
  return handleApiRequest(
    () => api.post('api/reef/workflows/blocks', { json: data }),
    {
      toast,
      successTitle: '创建成功',
      errorTitle: '创建失败'
    }
  );
}

export async function getBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  blockId: string
): Promise<BlockTranslation | null> {
  return handleApiRequest(
    () => api.get(`api/reef/workflows/blocks/${blockId}`),
    {
      toast,
      errorTitle: '获取失败'
    }
  );
}

export async function updateBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  blockId: string,
  data: BlockTranslationUpdate
): Promise<BlockTranslation | null> {
  return handleApiRequest(
    () => api.put(`api/reef/workflows/blocks/${blockId}`, { json: data }),
    {
      toast,
      successTitle: '更新成功',
      errorTitle: '更新失败'
    }
  );
}

export async function deleteBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  blockId: string
): Promise<boolean> {
  const result = await handleApiRequest(
    () => api.delete(`api/reef/workflows/blocks/${blockId}`),
    {
      toast,
      successTitle: '删除成功',
      errorTitle: '删除失败'
    }
  );
  return result !== null;
}

export async function syncBlockTranslations(
  api: ReturnType<typeof useAuthApi>
): Promise<BlockTranslation[] | null> {
  return handleApiRequest(
    () =>
      api.post('api/reef/workflows/blocks/sync', {
        json: {}
      }),
    {
      toast,
      successTitle: '同步成功',
      errorTitle: '同步失败'
    }
  );
}
