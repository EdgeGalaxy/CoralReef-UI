'use client';

import * as React from 'react';
import { ChevronsUpDown, Plus, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkSpace {
  id: string;
  name: string;
  logo: React.ElementType;
  plan: string;
}

interface WorkSpaceSwitcherProps {
  workspaces: WorkSpace[];
  selectedWorkSpaceId?: string;
  onWorkSpaceSelect?: (workspaceId: string) => void;
  onCreateWorkSpace?: () => void;
  isLoading?: boolean;
  error?: any;
}

export function WorkSpaceSwitcher({
  workspaces,
  selectedWorkSpaceId,
  onWorkSpaceSelect,
  onCreateWorkSpace,
  isLoading = false,
  error
}: WorkSpaceSwitcherProps) {
  const { isMobile } = useSidebar();

  // 通过 ID 查找当前选中的工作空间
  const activeWorkSpace = React.useMemo(() => {
    if (!workspaces?.length) return null;
    if (selectedWorkSpaceId) {
      const selected = workspaces.find(
        (workspace) => workspace.id === selectedWorkSpaceId
      );
      return selected || workspaces[0];
    }
    return workspaces[0];
  }, [workspaces, selectedWorkSpaceId]);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="bg-sidebar-muted flex size-8 items-center justify-center rounded-lg">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="flex-1 text-left text-sm leading-tight">
              <span className="font-semibold">加载中...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (error) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Alert variant="destructive" className="py-2">
            <AlertDescription>工作空间加载失败</AlertDescription>
          </Alert>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeWorkSpace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={onCreateWorkSpace}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Plus className="size-4" />
            </div>
            <div className="flex-1 text-left text-sm leading-tight">
              <span className="font-semibold">创建工作空间</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeWorkSpace.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorkSpace.name}
                </span>
                <span className="truncate text-xs">{activeWorkSpace.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              工作空间
            </DropdownMenuLabel>
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => onWorkSpaceSelect?.(workspace.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <workspace.logo className="size-4 shrink-0" />
                </div>
                {workspace.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => onCreateWorkSpace?.()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                添加工作空间
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
