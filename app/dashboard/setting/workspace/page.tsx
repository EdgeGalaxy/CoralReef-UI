'use client';

import { useState } from 'react';
import { useAuthApi, useAuthSWR } from '@/components/hooks/useAuthReq';
import { useToast } from '@/components/ui/use-toast';
import {
  useWorkspaces,
  WorkspaceResponse
} from '@/components/hooks/use-workspaces';
import { WorkspaceTable } from '@/components/tables/workspace/client';
import { Workspace } from '@/types/workspace';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { handleApiRequest } from '@/lib/error-handle';

import DashboardLoading from '../../loading';
import DashboardError from '../../error';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '设置', link: '/dashboard/setting' },
  { title: '工作空间', link: '/dashboard/setting/workspace' }
];

const DEFAULT_WORKSPACE_DATA: WorkspaceResponse = {
  total: 0,
  page: 1,
  page_size: 10,
  total_pages: 1,
  items: []
};

export default function WorkspaceSettingsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();
  const api = useAuthApi();
  const {
    getMyWorkspaces,
    deleteWorkspace,
    addWorkspaceUser,
    removeWorkspaceUser
  } = useWorkspaces(api);

  const {
    data: workspaces = DEFAULT_WORKSPACE_DATA,
    error,
    mutate
  } = useAuthSWR<WorkspaceResponse>(
    `/api/reef/workspaces/me?page=${page}&page_size=${pageSize}`
  );

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!workspaces) return <DashboardLoading />;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    try {
      await handleApiRequest(() => deleteWorkspace(workspaceId), {
        toast,
        successTitle: '删除成功',
        errorTitle: '删除失败',
        onSuccess: async () => {
          await mutate();
        }
      });
    } catch (error) {
      console.error('Failed to delete workspace:', error);
    }
  };

  const handleAddUser = async (
    workspaceId: string,
    ownerUserId: string,
    userId: string,
    role: string
  ) => {
    try {
      await handleApiRequest(
        () => addWorkspaceUser(workspaceId, ownerUserId, userId, role),
        {
          toast,
          successTitle: '添加成功',
          errorTitle: '添加失败',
          onSuccess: async () => {
            await mutate();
          }
        }
      );
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleRemoveUser = async (workspaceId: string, userId: string) => {
    try {
      await handleApiRequest(() => removeWorkspaceUser(workspaceId, userId), {
        toast,
        successTitle: '移除成功',
        errorTitle: '移除失败',
        onSuccess: async () => {
          await mutate();
        }
      });
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className="relative space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`工作空间 (${workspaces.total || 0})`}
              description="管理工作空间和团队成员"
            />
          </div>
          <Separator className="my-4" />
          <WorkspaceTable
            workspaces={workspaces}
            mutate={mutate}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onManageUsers={handleAddUser}
            onDelete={handleDeleteWorkspace}
          />
        </div>
      </div>
    </PageContainer>
  );
}
