export type SourceDataModel = {
  id?: string;
  name: string;
  description?: string;
  sourceType: number;
  deviceId?: string;
  link: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type Gateway = {
  id: string;
  name: string;
  description: string;
  deviceType: string;
  publicIP?: string;
  internalIP?: string;
  status: number;
  deploymentCount: number;
  gatewayVersion: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type DeploymentDataModel = {
  id: string;
  name: string;
  description: string | null;
  deviceId: string;
  pipelineId: string;
  organizationId: string | null;
  state: number;
  createdAt: string;
  updatedAt: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
