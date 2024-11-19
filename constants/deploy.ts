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
  created_at: string;
  updated_at: string;
};

export enum OperationStatus {
  STOPPED = 0,
  RUNNING = 1,
  ERROR = 2
}

export type Workflow = {
  id: string;
  name: string;
  description?: string;
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
