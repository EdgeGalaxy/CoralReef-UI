export interface WorkflowCreate {
  name: string;
  description: string;
  specification?: Specification;
  data: {
    nodes: any[];
    edges: any[];
  };
}

export interface Specification {
  version: string;
  inputs: any[];
  steps: any[];
  outputs: any[];
}

export interface WorkflowResponse extends WorkflowCreate {
  id: string;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  workspace_name: string;
}
