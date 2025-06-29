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

import DashboardLoading from '@/app/dashboard/loading';
import DashboardError from '@/app/dashboard/error';

interface GatewayCommand {
  name: string;
  description: string;
  code_snippet: string;
}

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

  const { data: gatewayCommand } = useAuthSWR<GatewayCommand>(
    `/api/reef/workspaces/${workspaceId}/gateways/install-command`
  );

  const createGatewayCommand: GatewayCommand = gatewayCommand || {
    name: '新建网关',
    description: '在设备上执行以下命令',
    code_snippet: `curl -s https://loopeai.oss-cn-shanghai.aliyuncs.com/setup/init-bash/setup-client.sh | bash -s ${workspaceId}`
  };

  const handleCreateSuccess = async () => {
    await mutate(undefined, { revalidate: true });
  };

  // Handle error state
  if (error) return <DashboardError error={error} reset={() => mutate()} />;
  // Handle loading state
  if (!gateways) return <DashboardLoading />;

  return (
    <PageContainer scrollable={true}>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`网关 (${gateways.length})`}
              description="管理网关设备"
            />
            <CreateGatewayModal
              name={createGatewayCommand.name}
              description={createGatewayCommand.description}
              codeSnippet={createGatewayCommand.code_snippet}
            />
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
