export interface TemplateResponse {
  id: string;
  name: string;
  description: string;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  usage_count: number;
  creator: {
    id: string;
    username: string;
  };
}

export interface WorkflowSync {
  workflow_id: string;
  project_id?: string;
  api_key?: string;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
