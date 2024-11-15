'use client';
import { SourceDataModel, DeploymentDataModel } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sidebar } from './_sidebar';
import { DeploymentTable } from '@/components/tables/deployment/client';
import { useAuthSWR, useAuthApi } from '@/hooks/useAuthReq';
import { EditableField } from './components/editable-field';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  source: SourceDataModel;
  onRefresh: () => void;
  onClose: () => void;
}

function SourceDetail({ source, onRefresh, onClose }: Props) {
  const api = useAuthApi();
  const { toast } = useToast();

  const handleUpdate = async (
    field: keyof SourceDataModel,
    newValue: string
  ) => {
    try {
      const res = await api.put(
        `api/reef/workspaces/${source.workspace_id}/cameras/${source.id}`,
        {
          json: {
            [field]: newValue
          }
        }
      );
      if (res.ok) {
        toast({
          title: '数据源更新成功'
        });
        onRefresh();
      }
    } catch (error: any) {
      if (error.name === 'HTTPError') {
        const res = await error.response.json();
        toast({
          variant: 'destructive',
          title: '数据源更新失败',
          description: `${res.message}`
        });
      } else {
        toast({
          variant: 'destructive',
          title: '数据源更新失败',
          description:
            error instanceof Error ? `${error.message}` : '请稍后重试'
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(
        `api/reef/workspaces/${source.workspace_id}/cameras/${source.id}`
      );
      if (res.ok) {
        toast({
          title: '数据源删除成功'
        });
        onRefresh();
        onClose();
      }
    } catch (error: any) {
      if (error.name === 'HTTPError') {
        const res = await error.response.json();
        toast({
          variant: 'destructive',
          title: '数据源删除失败',
          description: `${res.message}`
        });
      } else {
        toast({
          variant: 'destructive',
          title: '数据源删除失败',
          description:
            error instanceof Error ? `${error.message}` : '请稍后重试'
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <EditableField
          value={source.name}
          label="数据源名"
          onUpdate={(newValue) => handleUpdate('name', newValue)}
        />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">数据源名</span>
          <span className="font-medium">{source.name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">数据源类型</span>
          <span className="font-medium">{source.type}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">网关名</span>
          <span className="font-medium">{source.gateway_name}</span>
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
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleDelete}
        >
          <Icons.trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>
    </div>
  );
}

export function SourceSidebar({ source, onRefresh, onClose }: Props) {
  const { data: deployments, error: deploymentsError } = useAuthSWR<
    DeploymentDataModel[]
  >(
    `/api/reef/workspaces/${source.workspace_id}/cameras/${source.id}/deployments`
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
      detailContent={
        <SourceDetail source={source} onRefresh={onRefresh} onClose={onClose} />
      }
      tabs={tabConfig}
      defaultTab="preview"
    />
  );
}
