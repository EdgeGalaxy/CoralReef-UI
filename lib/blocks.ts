import { createApi } from './utils';
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
  token: string,
  data: BlockTranslationCreate
): Promise<BlockTranslation | null> {
  const api = createApi(token);
  return handleApiRequest(() => api.post('blocks', { json: data }), {
    toast,
    successTitle: '创建成功',
    errorTitle: '创建失败'
  });
}

export async function getBlockTranslations(
  token: string,
  language?: string,
  disabled?: boolean
): Promise<BlockTranslation[] | null> {
  const api = createApi(token);
  const params = new URLSearchParams();
  if (language) params.append('language', language);
  if (disabled !== undefined) params.append('disabled', disabled.toString());

  return handleApiRequest(() => api.get(`blocks?${params.toString()}`), {
    toast,
    errorTitle: '获取失败'
  });
}

export async function getBlockTranslation(
  token: string,
  blockId: string
): Promise<BlockTranslation | null> {
  const api = createApi(token);
  return handleApiRequest(() => api.get(`blocks/${blockId}`), {
    toast,
    errorTitle: '获取失败'
  });
}

export async function updateBlockTranslation(
  token: string,
  blockId: string,
  data: BlockTranslationUpdate
): Promise<BlockTranslation | null> {
  const api = createApi(token);
  return handleApiRequest(() => api.put(`blocks/${blockId}`, { json: data }), {
    toast,
    successTitle: '更新成功',
    errorTitle: '更新失败'
  });
}

export async function deleteBlockTranslation(
  token: string,
  blockId: string
): Promise<boolean> {
  const api = createApi(token);
  const result = await handleApiRequest(() => api.delete(`blocks/${blockId}`), {
    toast,
    successTitle: '删除成功',
    errorTitle: '删除失败'
  });
  return result !== null;
}

export async function syncBlockTranslations(
  token: string,
  data: BlockTranslationSync
): Promise<BlockTranslation[] | null> {
  const api = createApi(token);
  return handleApiRequest(() => api.post('blocks/sync', { json: data }), {
    toast,
    successTitle: '同步成功',
    errorTitle: '同步失败'
  });
}
