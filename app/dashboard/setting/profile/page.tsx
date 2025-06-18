'use client';

import { useState } from 'react';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/constants/user';
import DashboardLoading from '@/app/dashboard/loading';
import DashboardError from '@/app/dashboard/error';
import UserProfileForm from '@/components/forms/user-profile-form';
import ResetPasswordModal from '@/components/modal/reset-password-modal';

const breadcrumbItems = [
  { title: '首页', link: '/dashboard' },
  { title: '设置', link: '/dashboard/setting' },
  { title: '个人资料', link: '/dashboard/setting/profile' }
];

export default function ProfilePage() {
  const {
    data: userProfile,
    error,
    isLoading,
    mutate
  } = useAuthSWR<UserProfile>('/auth/users/me');

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError error={error} reset={() => mutate()} />;

  return (
    <PageContainer scrollable={true}>
      <div className="flex items-center justify-between">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="space-y-8 pb-12">
        {/* 个人资料部分 */}
        <div className="py-6">
          <h2 className="mb-6 text-xl font-semibold">基本信息</h2>
          {userProfile && (
            <UserProfileForm user={userProfile} onUpdateSuccess={mutate} />
          )}
        </div>

        <Separator />

        {/* 安全设置部分 */}
        <div className="py-6">
          <h2 className="mb-6 text-xl font-semibold">安全设置</h2>
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-medium">账户密码</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                更改您的账户密码以确保账户安全
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => setIsResetPasswordOpen(true)}
                  variant="outline"
                >
                  更改密码
                </Button>
              </div>
            </div>

            {userProfile?.is_verified === false && (
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-medium">邮箱验证</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  您的邮箱尚未验证，验证邮箱可以提高账户安全性
                </p>
                <div className="mt-4">
                  <Button variant="outline">发送验证邮件</Button>
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-medium">账户活动</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                上次登录时间:{' '}
                {userProfile?.last_login_at
                  ? new Date(userProfile.last_login_at).toLocaleString()
                  : '未知'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 密码重设模态框 */}
      {isResetPasswordOpen && (
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
        />
      )}
    </PageContainer>
  );
}
