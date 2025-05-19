'use client';

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar/app-sidebar';
import OAuthCompleteProfileModal from '@/components/modal/oauth-complete-profile-modal';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset data-sidebar="sidebar">
          <SidebarTrigger />
          {children}
        </SidebarInset>
      </SidebarProvider>

      {/* OAuth 用户信息完善弹窗 */}
      <OAuthCompleteProfileModal />
    </div>
  );
}
