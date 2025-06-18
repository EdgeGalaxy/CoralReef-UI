'use client';

import { useEffect, useState } from 'react';
import { LoginModal } from '@/components/forms/admin/login-modal';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/sidebar/admin-sidebar';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check');
        if (response.ok) {
          setIsAuthenticated(true);
          setShowLoginModal(false);
        } else {
          setIsAuthenticated(false);
          setShowLoginModal(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setShowLoginModal(true);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            // 如果未认证，不允许关闭登录框
            if (!isAuthenticated) return;
            setShowLoginModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset data-sidebar="sidebar">
          <SidebarTrigger />
          {children}
        </SidebarInset>
      </SidebarProvider>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
