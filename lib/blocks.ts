import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from './error-handle';
import { toast } from '@/components/ui/use-toast';

export interface BlockTranslation {
  id: string;
  name: string;
  content: string;
  language: string;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlockTranslationCreate {
  name: string;
  content: string;
  language: string;
}

export interface BlockTranslationUpdate {
  name?: string;
  content?: string;
  disabled?: boolean;
}

export interface BlockTranslationSync {
  source: string;
  data: BlockTranslation[];
}

export async function createBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  data: BlockTranslationCreate
): Promise<BlockTranslation | null> {
  return handleApiRequest(() => api.post('api/reef/blocks', { json: data }), {
    toast,
    successTitle: '创建成功',
    errorTitle: '创建失败'
  });
}

export async function getBlockTranslations(
  api: ReturnType<typeof useAuthApi>,
  disabled?: boolean
): Promise<BlockTranslation[] | null> {
  const params = new URLSearchParams();
  if (disabled !== undefined) params.append('disabled', disabled.toString());

  return handleApiRequest(
    () => api.get(`api/reef/blocks?${params.toString()}`),
    {
      toast,
      errorTitle: '获取失败'
    }
  );
}

export async function getBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  blockId: string
): Promise<BlockTranslation | null> {
  return handleApiRequest(() => api.get(`blocks/${blockId}`), {
    toast,
    errorTitle: '获取失败'
  });
}

export async function updateBlockTranslation(
  api: ReturnType<typeof useAuthApi>,
  blockId: string,
  data: BlockTranslationUpdate
): Promise<BlockTranslation | null> {
  return handleApiRequest(
    () => api.put(`api/reef/blocks/${blockId}`, { json: data }),
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
    () => api.delete(`api/reef/blocks/${blockId}`),
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
      api.post('api/reef/blocks/sync', {
        json: {}
      }),
    {
      toast,
      successTitle: '同步成功',
      errorTitle: '同步失败'
    }
  );
}
