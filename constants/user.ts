export interface UserProfile {
  id: string;
  email: string;
  username: string;
  phone?: string;
  avatar?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface UserRead {
  id: string;
  email: string;
  username: string;
  phone?: string;
  select_workspace_id?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  access_token?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface UserUpdate {
  password?: string;
  email?: string;
  username?: string;
  phone?: string;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
  max_users?: number;
}

export interface WorkspaceUser {
  id: string;
  username: string;
  email: string;
  role: string;
  join_at: string;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  description?: string;
  owner_user_id: string;
  users?: WorkspaceUser[];
  created_at: string;
  updated_at: string;
  user_count: number;
  current_user_role: string;
}

export interface PaginationResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: T[];
}
