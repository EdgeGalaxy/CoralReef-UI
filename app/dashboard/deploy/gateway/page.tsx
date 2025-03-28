'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Gateway } from '@/constants/deploy';
import { GatewayTable } from '@/components/tables/gateway/client';
import { GatewaySidebar } from '@/components/sidebar/gateway';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CreateGatewayModal } from '@/components/modal/create-gateway';
import { useAuthSWR } from '@/components/hooks/useAuthReq';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '网关', link: '/dashboard/deploy/gateway' }
];

export default function GatewayPage() {
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const params = useParams();
  const session = useSession();
  const workspaceId =
    (params?.workspaceId as string) || session.data?.user.select_workspace_id;

  const {
    data: gateways,
    error,
    mutate
  } = useAuthSWR<Gateway[]>(`/api/reef/workspaces/${workspaceId}/gateways`);

  const createGatewayMock = {
    name: '新建网关',
    description: '在设备上执行以下命令',
    codeSnippet: `curl -s https://reef.oss-cn-hangzhou.aliyuncs.com/setup/init-bash/setup-client.sh | bash -s ${workspaceId}`
  };

  const handleCreateSuccess = async () => {
    await mutate(undefined, { revalidate: true });
  };

  // Handle loading state
  if (!gateways) return <div>Loading...</div>;
  // Handle error state
  if (error) return <div>Error loading gateways</div>;

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`网关 (${gateways.length})`}
              description="管理网关设备"
            />
            <CreateGatewayModal {...createGatewayMock} />
          </div>
          <Separator className="my-4" />
          <GatewayTable
            gateways={gateways}
            onSelectGateway={(gateway: Gateway) => setSelectedGateway(gateway)}
          />
          {selectedGateway && (
            <GatewaySidebar
              gateway={selectedGateway}
              onClose={() => setSelectedGateway(null)}
              onRefresh={handleCreateSuccess}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
