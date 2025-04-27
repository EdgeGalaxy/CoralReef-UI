export interface WorkspaceUser {
  id: string;
  username: string;
  role: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  users?: WorkspaceUser[];
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDetail extends Workspace {
  user_count: number;
  current_user_role: string;
}
