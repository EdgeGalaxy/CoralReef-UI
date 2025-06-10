export type SourceDataModel = {
  id: string;
  name: string;
  description: string;
  type: CameraType;
  path: string | number;
  gateway_id?: string;
  gateway_name?: string;
  workspace_id: string;
  workspace_name: string;
  created_at: string;
  updated_at: string;
};

export enum CameraType {
  RTSP = 'rtsp',
  USB = 'usb',
  FILE = 'file'
}

export type Gateway = {
  id: string;
  name: string;
  description: string;
  version: string;
  platform: string;
  ip_address?: string;
  mac_address?: string;
  status: GatewayStatus;
  workspace_id: string;
  workspace_name: string;
  created_at: string;
  updated_at: string;
};

export enum GatewayStatus {
  OFFLINE = 'offline',
  ONLINE = 'online'
}

export type DeploymentDataModel = {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  gateway_id: string;
  gateway_name: string;
  camera_ids: string[];
  camera_names: string[];
  workflow_id: string;
  workflow_name: string;
  pipeline_id?: string;
  workspace_id: string;
  running_status: OperationStatus;
  output_image_fields: string[];
  created_at: string;
  updated_at: string;
};

export type WebRTCOfferResponse = {
  type: string;
  sdp: string;
};

export enum OperationStatus {
  PENDING = 'pending',
  STOPPED = 'stopped',
  RUNNING = 'running',
  WARNING = 'warning',
  FAILURE = 'failure',
  MUTED = 'muted',
  // PAUSED = 'paused',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout'
}

export type Workflow = {
  id: string;
  name: string;
  description?: string;
  data?: Record<string, any>;
  specification: Record<string, any>;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
};

export type DeploymentCreate = {
  name: string;
  description: string;
  gateway: Gateway | undefined;
  workflow: Workflow | undefined;
  cameras: SourceDataModel[];
  parameters: Record<string, any>;
};

export const STATUS_CONFIG = {
  [OperationStatus.STOPPED]: {
    text: '停止',
    color: 'gray',
    icon: 'stopped'
  },
  [OperationStatus.RUNNING]: {
    text: '运行中',
    color: 'green',
    icon: 'online'
  },
  [OperationStatus.PENDING]: {
    text: '初始化',
    color: 'yellow',
    icon: 'spinner'
  },
  [OperationStatus.WARNING]: {
    text: '警告',
    color: 'orange',
    icon: 'offline'
  },
  [OperationStatus.FAILURE]: {
    text: '失败',
    color: 'red',
    icon: 'offline'
  },
  [OperationStatus.NOT_FOUND]: {
    text: '未找到',
    color: 'gray',
    icon: 'offline'
  },
  [OperationStatus.MUTED]: {
    text: '已暂停',
    color: 'gray',
    icon: 'muted'
  },
  [OperationStatus.TIMEOUT]: {
    text: '超时',
    color: 'gray',
    icon: 'timeout'
  }
} as const;

export const getStatusConfig = (status: OperationStatus) => {
  return (
    STATUS_CONFIG[status] || {
      text: '错误',
      color: 'gray',
      icon: 'offline'
    }
  );
};
