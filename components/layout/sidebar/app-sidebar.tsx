'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Home,
  Workflow,
  Server,
  CircuitBoard,
  Settings,
  Blocks
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import Image from 'next/image';

import { NavMain } from '@/components/layout/sidebar/nav-main';
import { NavUser } from '@/components/layout/sidebar/nav-user';
import { WorkSpaceSwitcher } from '@/components/layout/sidebar/space-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';
import CreateWorkspaceDialog from '@/components/modal/create-workspace';
import {
  UserProfile,
  WorkspaceResponse,
  PaginationResponse
} from '@/constants/user';

const data = {
  navMain: [
    {
      title: '首页',
      url: '/dashboard',
      icon: Home,
      isActive: true
    },
    {
      title: '工作流',
      url: '/dashboard/workflow',
      icon: Workflow
    },
    {
      title: '部署',
      url: '/dashboard/deploy/gateway',
      icon: Server,
      items: [
        {
          title: '网关',
          url: '/dashboard/deploy/gateway'
        },
        {
          title: '数据源',
          url: '/dashboard/deploy/source'
        },
        {
          title: '服务',
          url: '/dashboard/deploy/deployment'
        }
      ]
    },
    {
      title: '模型',
      url: '/dashboard/ml-models',
      icon: CircuitBoard
    },
    {
      title: '节点',
      url: '/dashboard/blocks',
      icon: Blocks
    },
    {
      title: '设置',
      url: '/dashboard/settings',
      icon: Settings,
      items: [
        {
          title: '工作空间',
          url: '/dashboard/setting/workspace'
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, update: updateSession } = useSession();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(
    session?.user.select_workspace_id || ''
  );
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  // 获取工作空间数据
  const {
    data: workspacesData,
    error: workspacesError,
    mutate: mutateWorkspaces
  } = useAuthSWR<PaginationResponse<WorkspaceResponse>>(
    '/api/reef/workspaces/me'
  );

  // 获取用户详细信息
  const {
    data: userProfile,
    error: userError,
    isLoading: userLoading
  } = useAuthSWR<UserProfile>('/auth/users/me');

  useEffect(() => {
    setSelectedWorkspace(session?.user.select_workspace_id || '');
  }, [session?.user.select_workspace_id]);

  useEffect(() => {
    if (workspacesData?.items?.length && !selectedWorkspace && session?.user) {
      setSelectedWorkspace(session.user.select_workspace_id || '');
    }
  }, [workspacesData, selectedWorkspace, session?.user]);

  // 将 API 数据转换为 WorkSpaceSwitcher 所需的格式
  const workspaces = Array.isArray(workspacesData?.items)
    ? workspacesData?.items?.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
        logo: Server,
        plan: 'Enterprise' // 默认值，可以根据实际情况调整
      }))
    : [];

  // 构建用户数据，优先使用 API 获取的详细信息，回退到 session 中的基本信息
  const userData = {
    name: userProfile?.username || session?.user?.username || '未知用户',
    email: userProfile?.email || session?.user?.email || '',
    avatar:
      userProfile?.avatar || session?.user?.image || '/avatars/default.jpg'
  };

  const handleWorkspaceSelect = async (value: string) => {
    if (value === 'create-new') {
      setIsCreateWorkspaceOpen(true);
      return;
    }

    try {
      // 1. 先更新本地状态
      setSelectedWorkspace(value);

      // 2. 调用 update session
      const result = await updateSession({
        ...session,
        user: {
          ...session?.user,
          select_workspace_id: value
        }
      });

      // 3. 验证更新是否成功
      if (!result) {
        console.error('Session update failed');
        // 可能需要回滚本地状态
        setSelectedWorkspace(session?.user.select_workspace_id || '');
        return;
      }
    } catch (error) {
      console.error('Failed to update workspace:', error);
      // 发生错误时回滚本地状态
      setSelectedWorkspace(session?.user.select_workspace_id || '');
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-6">
        <div className="mb-4 flex justify-center">
          <Image
            src="/loopeai.svg"
            alt="LoopEAI Logo"
            width={120}
            height={30}
            className="dark:invert"
          />
        </div>
        <WorkSpaceSwitcher
          workspaces={workspaces}
          selectedWorkSpaceId={selectedWorkspace}
          onWorkSpaceSelect={handleWorkspaceSelect}
          onCreateWorkSpace={() => setIsCreateWorkspaceOpen(true)}
          isLoading={!workspacesData?.items || !workspacesError}
          error={workspacesError}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} isLoading={userLoading} error={userError} />
      </SidebarFooter>
      <SidebarRail />

      <CreateWorkspaceDialog
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onSuccess={() => {
          mutateWorkspaces();
        }}
      />
    </Sidebar>
  );
}
