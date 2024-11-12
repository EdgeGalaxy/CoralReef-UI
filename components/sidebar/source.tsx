'use client';
import {
  SourceDataModel,
  DeploymentDataModel,
  OperationStatus
} from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sidebar } from './_sidebar';
import { DeploymentTable } from '@/components/tables/deployment/client';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

interface Props {
  source: SourceDataModel;
  onClose: () => void;
}

function SourceDetail({ source }: { source: SourceDataModel }) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">数据源名</span>
          <span className="font-medium">{source.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">数据源类型</span>
          <span className="font-medium">{source.type}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">设备名</span>
          <span className="font-medium">{source.workspace_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">创建时间</span>
          <span className="font-medium">
            {new Date(source.created_at).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.refreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>
    </div>
  );
}

export function SourceSidebar({ source, onClose }: Props) {
  const { data: deployments, error: deploymentsError } = useSWR<
    DeploymentDataModel[]
  >(
    `/api/reef/workspaces/${source.workspace_id}/cameras/${source.id}/deployments`,
    fetcher
  );

  const tabConfig = [
    {
      value: 'preview',
      label: '预览',
      content: <div>预览内容</div>
    },
    {
      value: 'deployments',
      label: '关联服务',
      content: deploymentsError ? (
        <div>Error loading deployments</div>
      ) : !deployments ? (
        <div>Loading...</div>
      ) : (
        <DeploymentTable
          deployments={deployments}
          onSelectDeployment={(deployment: DeploymentDataModel) => {}}
        />
      )
    },
    {
      value: 'settings',
      label: '设置',
      content: <div>设置内容</div>
    }
  ];

  return (
    <Sidebar
      title={source.name}
      onClose={onClose}
      detailContent={<SourceDetail source={source} />}
      tabs={tabConfig}
      defaultTab="preview"
    />
  );
}
