'use client';
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DashboardNav } from '@/components/dashboard-nav';
import { navItems } from '@/constants/data';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { ChevronLeft } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';
import { NavItem } from '@/types';
import { useAuthSWR } from '@/hooks/useAuthReq';
import CreateWorkspaceDialog from '@/components/modal/create-workspace';

type SidebarProps = {
  className?: string;
};

interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { data: session, update: updateSession } = useSession();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>(
    session?.user.select_workspace_id || ''
  );
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  const {
    data: workspaces,
    error,
    mutate
  } = useAuthSWR<Workspace[]>('/api/reef/workspaces/me');

  useEffect(() => {
    setSelectedWorkspace(session?.user.select_workspace_id || '');
  }, [session?.user.select_workspace_id]);

  useEffect(() => {
    if (workspaces?.length && !selectedWorkspace && session?.user) {
      setSelectedWorkspace(session.user.select_workspace_id || '');
    }
  }, [workspaces, selectedWorkspace]);

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

  const handleToggle = () => {
    toggle();
  };

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      setExpandedItems((prev) =>
        prev.includes(item.title)
          ? prev.filter((title) => title !== item.title)
          : [...prev, item.title]
      );
    }
  };

  return (
    <aside
      className={cn(
        `relative  hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      <div className="hidden p-5 pt-10 lg:block">
        <Link
          href={'./dashboard'}
          target="_blank"
          className="mt-4 inline-block"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
        </Link>

        <Select
          onValueChange={handleWorkspaceSelect}
          value={selectedWorkspace || undefined}
        >
          <SelectTrigger className={cn('w-full', isMinimized && 'hidden')}>
            <SelectValue placeholder={error ? '加载失败' : ''} />
          </SelectTrigger>
          <SelectContent>
            {workspaces?.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
            <SelectItem value="create-new" className="text-primary">
              + 创建新工作空间
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-10 z-50  cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav
              items={navItems}
              isMinimized={isMinimized}
              expandedItems={expandedItems}
              onItemClick={handleItemClick}
            />
          </div>
        </div>
      </div>
      <CreateWorkspaceDialog
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onSuccess={() => {
          mutate();
        }}
      />
    </aside>
  );
}
