'use client';

import type { KyInstance } from 'ky';
import { WorkspaceDetail, PaginationResponse } from '@/constants/user';

export function useWorkspaces(api: KyInstance) {
  const getMyWorkspaces = async (
    page?: number,
    pageSize?: number
  ): Promise<PaginationResponse<WorkspaceDetail>> => {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page.toString());
    if (pageSize !== undefined)
      queryParams.append('page_size', pageSize.toString());

    const url = `api/reef/workspaces/me${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;
    const response = await api.get(url);
    const data = await response.json();

    // 如果返回的是数组（没有分页），转换为分页格式
    if (Array.isArray(data)) {
      return {
        total: data.length,
        page: 1,
        page_size: data.length,
        total_pages: 1,
        items: data
      };
    }

    return data as PaginationResponse<WorkspaceDetail>;
  };

  const deleteWorkspace = async (workspaceId: string): Promise<Response> => {
    const response = await api.delete(`api/reef/workspaces/${workspaceId}`);
    return response;
  };

  const addWorkspaceUser = async (
    workspaceId: string,
    ownerUserId: string,
    userId: string,
    role: string
  ): Promise<Response> => {
    const response = await api.get(
      `api/reef/workspaces/${workspaceId}/users/${ownerUserId}/${role}/${userId}`
    );
    return response;
  };

  const removeWorkspaceUser = async (
    workspaceId: string,
    userId: string
  ): Promise<Response> => {
    const response = await api.delete(
      `api/reef/workspaces/${workspaceId}/users/${userId}`
    );
    return response;
  };

  const updateWorkspace = async (
    workspaceId: string,
    data: {
      name?: string;
      description?: string;
      max_users?: number;
    }
  ): Promise<Response> => {
    const response = await api.put(`api/reef/workspaces/${workspaceId}`, {
      json: data
    });
    return response;
  };

  return {
    getMyWorkspaces,
    deleteWorkspace,
    addWorkspaceUser,
    removeWorkspaceUser,
    updateWorkspace
  };
}
