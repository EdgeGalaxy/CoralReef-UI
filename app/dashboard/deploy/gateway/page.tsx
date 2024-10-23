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

const breadcrumbItems = [
  { title: '部署', link: '/dashboard/deploy/gateway' },
  { title: '网关', link: '/dashboard/deploy/gateway' }
];

// Mock data
const mockGateways: Gateway[] = [
  {
    id: '1',
    name: 'Device 1',
    description: 'Description 1',
    deviceType: 'Type 1',
    publicIP: '192.168.1.1',
    internalIP: '10.0.0.1',
    gatewayVersion: 'v1.0',
    organizationId: 'org1',
    status: 1,
    deploymentCount: 3,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Device 2',
    description: 'Description 2',
    deviceType: 'Type 2',
    publicIP: '192.168.1.2',
    internalIP: '10.0.0.2',
    gatewayVersion: 'v1.1',
    organizationId: 'org2',
    status: 0,
    deploymentCount: 3,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z'
  }
];

const createGatewayMock = {
  name: 'Gateway 1',
  description: 'Description 1',
  codeSnippet: 'curl -X GET http://localhost:8080/api/v1/gateway'
};

export default function GatewayPage() {
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`网关 (${mockGateways.length})`}
              description="管理网关设备"
            />
            <CreateGatewayModal {...createGatewayMock} />
          </div>
          <Separator className="my-4" />
          <GatewayTable
            gateways={mockGateways}
            onSelectGateway={(gateway: Gateway) => setSelectedGateway(gateway)}
          />
          {selectedGateway && (
            <GatewaySidebar
              gateway={selectedGateway}
              onClose={() => setSelectedGateway(null)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
