'use client';

import { DeploymentDataModel, OperationStatus } from '@/constants/deploy';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sidebar } from './_sidebar';
import { EditableField } from './components/editable-field';

interface Props {
  deployment: DeploymentDataModel;
  onClose: () => void;
}

function DeploymentDetail({ deployment }: { deployment: DeploymentDataModel }) {
  const handleUpdate = async (
    field: keyof DeploymentDataModel,
    newValue: string
  ) => {
    // Implement the API call to update the gateway
    console.log(`Updating ${field} to ${newValue}`);
    // Example: await updateGateway(gateway.id, { [field]: newValue });
  };

  return (
    <div>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <EditableField
          value={deployment.name}
          label="服务名"
          onUpdate={(newValue) => handleUpdate('name', newValue)}
        />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">网关</span>
          <span className="font-medium">{deployment.gateway_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">工作流</span>
          <span className="font-medium">{deployment.workflow_name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">创建时间</span>
          <span className="font-medium">
            {new Date(deployment.created_at).toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-6 flex space-x-4">
        <Button
          size="sm"
          className={`text-xs ${
            deployment.running_status === OperationStatus.STOPPED
              ? 'bg-gray-500 hover:bg-gray-600'
              : deployment.running_status === OperationStatus.RUNNING
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {deployment.running_status === OperationStatus.STOPPED ? (
            <Icons.stopped className="mr-2 h-4 w-4" />
          ) : deployment.running_status === OperationStatus.RUNNING ? (
            <Icons.online className="mr-2 h-4 w-4" />
          ) : (
            <Icons.offline className="mr-2 h-4 w-4" />
          )}
          {deployment.running_status === OperationStatus.STOPPED
            ? '停止'
            : deployment.running_status === OperationStatus.RUNNING
            ? '运行中'
            : '错误'}
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.power className="mr-2 h-4 w-4" />
          重启
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.stopped className="mr-2 h-4 w-4" />
          停止
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Icons.trash2 className="mr-2 h-4 w-4" />
          删除
        </Button>
      </div>
    </div>
  );
}

export function DeploymentSidebar({ deployment, onClose }: Props) {
  const tabConfig = [
    {
      value: 'stream',
      label: '数据流',
      content: <div>数据流内容</div>
    },
    {
      value: 'logs',
      label: '服务日志',
      content: <div>日志内容</div>
    },
    {
      value: 'metrics',
      label: '指标',
      content: <div>指标内容</div>
    },
    {
      value: 'events',
      label: '操作日志',
      content: <div>操作日志内容</div>
    },
    {
      value: 'settings',
      label: '设置',
      content: <div>设置内容</div>
    }
  ];

  return (
    <Sidebar
      title={deployment.name}
      onClose={onClose}
      detailContent={<DeploymentDetail deployment={deployment} />}
      tabs={tabConfig}
      defaultTab="stream"
    />
  );
}
