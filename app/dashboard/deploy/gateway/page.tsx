'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Gateway, GatewayStatus } from '@/constants/deploy';
import { GatewayTable } from '@/components/tables/gateway/client';
import { GatewaySidebar } from '@/components/sidebar/gateway';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CreateGatewayModal } from '@/components/modal/create-gateway';
import { useAuthSWR } from '@/hooks/useAuthReq';
import { getSelectWorkspaceId } from '@/lib/utils';
import { useParams } from 'next/navigation';

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '网关', link: '/dashboard/deploy/gateway' }
];

const createGatewayMock = {
  name: '网关设置',
  description: '网关设置描述',
  codeSnippet: 'curl -X GET http://localhost:8080/api/v1/gateway'
};

export default function GatewayPage() {
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const params = useParams();
  const workspaceId = params?.workspaceId || getSelectWorkspaceId();

  const {
    data: gateways,
    error,
    mutate
  } = useAuthSWR<Gateway[]>(`/api/reef/workspaces/${workspaceId}/gateways`);

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
