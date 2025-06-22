export interface Event {
  id: string;
  event_type: string;
  details: Record<string, any>;
  created_at: string;
  workspace_id: string;
  gateway_id?: string;
  deployment_id?: string;
}
