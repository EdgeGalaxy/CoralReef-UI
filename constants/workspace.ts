import { z } from 'zod';

export const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  max_users: z.number().min(1).default(10)
});

export type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  max_users: number;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}
