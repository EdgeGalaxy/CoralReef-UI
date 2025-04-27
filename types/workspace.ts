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
  description: string;
  owner_user_id: string;
  users?: WorkspaceUser[];
  created_at: string;
  updated_at: string;
  user_count: number;
  current_user_role: string;
}
