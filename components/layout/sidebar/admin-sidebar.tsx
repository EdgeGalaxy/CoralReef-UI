'use client';

import * as React from 'react';
import { Workflow, CircuitBoard, Blocks } from 'lucide-react';

import { NavMain } from '@/components/layout/sidebar/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader
} from '@/components/ui/sidebar';
import Image from 'next/image';

const data = {
  navMain: [
    {
      title: '模型',
      url: '/admin/ml-models',
      icon: CircuitBoard,
      isActive: true
    },
    {
      title: '工作流模板',
      url: '/admin/workflow-template',
      icon: Workflow
    },
    {
      title: '节点',
      url: '/admin/blocks',
      icon: Blocks
    }
  ]
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="w-full md:w-60 lg:w-60">
      <SidebarHeader className="pt-6">
        <div className="mb-4 flex justify-start px-4">
          <Image
            src="/loopeai.svg"
            alt="LoopEAI Logo"
            width={120}
            height={30}
            className="dark:invert"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
