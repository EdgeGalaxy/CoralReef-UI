'use client';

import { useState } from 'react';
import { useAuthApi, useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { useWorkspaces } from '@/components/hooks/use-workspaces';
import { WorkspaceDetail, PaginationResponse } from '@/constants/user';
import { WorkspaceTable } from '@/components/tables/workspace/client';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { handleApiRequest } from '@/lib/error-handle';

import DashboardLoading from '@/app/dashboard/loading';
import DashboardError from '@/app/dashboard/error';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '设置', link: '/dashboard/setting' },
  { title: '工作空间', link: '/dashboard/setting/workspace' }
];

const DEFAULT_WORKSPACE_DATA = {
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
  const session = useSession();
  const api = useAuthApi();
  const {
    getMyWorkspaces,
    deleteWorkspace,
    addWorkspaceUser,
    removeWorkspaceUser,
    updateWorkspace
  } = useWorkspaces(api);

  const {
    data: workspaces = DEFAULT_WORKSPACE_DATA,
    error,
    mutate
  } = useAuthSWR<PaginationResponse<WorkspaceDetail>>(
    `/api/reef/workspaces/me?page=${page}&page_size=${pageSize}&with_users=true`
  );

  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  if (!workspaces) return <DashboardLoading />;

  const currentUserId = session.data?.user.id;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleUpdateWorkspace = async (
    workspaceId: string,
    data: {
      name?: string;
      description?: string;
      max_users?: number;
    }
  ) => {
    try {
      await handleApiRequest(() => updateWorkspace(workspaceId, data), {
        toast,
        successTitle: '更新成功',
        errorTitle: '更新失败',
        onSuccess: async () => {
          await mutate();
        }
      });
    } catch (error) {
      console.error('Failed to update workspace:', error);
    }
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
      <div className="flex-1 space-y-4 p-4 md:p-8">
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
            currentUserId={currentUserId || ''}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onManageUsers={handleAddUser}
            onRemoveUser={handleRemoveUser}
            onDelete={handleDeleteWorkspace}
            onUpdate={handleUpdateWorkspace}
          />
        </div>
      </div>
    </PageContainer>
  );
}
