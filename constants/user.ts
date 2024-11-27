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

export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string;
  max_users: number;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}
