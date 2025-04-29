import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    token: string;
    select_workspace_id?: string;
    username: string;
  }

  interface Session {
    user: User;
  }
}
