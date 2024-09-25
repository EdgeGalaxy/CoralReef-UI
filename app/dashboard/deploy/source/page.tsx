'use client';

import React, { useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { SourceDataModel } from '@/constants/deploy';
import { SourceTable } from '@/components/tables/source/client';
import { SourceSidebar } from '@/components/sidebar/source';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import CreateSourceDialog from '@/components/modal/create-source';

const breadcrumbItems = [
  { title: 'Deploy', link: '/dashboard/deploy/gateway' },
  { title: 'Deploy', link: '/dashboard/deploy/source' }
];

// Mock data
const mockSources: SourceDataModel[] = [
  {
    id: '1',
    name: 'Source 1',
    sourceType: 0,
    link: 'https://source1.com',
    organizationId: 'org1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Source 2',
    sourceType: 0,
    link: 'https://source2.com',
    organizationId: 'org2',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

export default function GatewayPage() {
  const [selectedSource, setSelectedSource] = useState<SourceDataModel | null>(
    null
  );

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <Heading
              title={`Source (${mockSources.length})`}
              description="Manage source devices"
            />
            <CreateSourceDialog />
          </div>
          <Separator className="my-4" />
          <SourceTable
            sources={mockSources}
            onSelectSource={(source: SourceDataModel) =>
              setSelectedSource(source)
            }
          />
          {selectedSource && (
            <SourceSidebar
              source={selectedSource}
              onClose={() => setSelectedSource(null)}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
