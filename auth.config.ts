import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import { noAuthApi } from '@/lib/utils';
import { UserRead, WorkspaceResponse } from '@/constants/user';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

declare module 'next-auth' {
  interface User extends UserRead {
    access_token?: string;
  }

  interface Session {
    accessToken?: string;
    user: User;
  }
}

const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialProvider({
      credentials: {
        email: {
          type: 'email'
        },
        password: {
          type: 'password'
        }
      },
      async authorize(credentials, req) {
        try {
          const formData = new URLSearchParams({
            username: credentials?.email as string,
            password: credentials?.password as string
          });

          const response = await noAuthApi.post<LoginResponse>(
            'auth/jwt/login',
            {
              body: formData,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );

          if (response.status !== 200) {
            throw new Error(`Login failed with status: ${response.status}`);
          }

          const data = await response.json();

          const userData = (await noAuthApi
            .get('auth/users/me', {
              headers: {
                Authorization: `Bearer ${data.access_token}`
              }
            })
            .json()) as UserRead;

          const userWorkspaces = (await noAuthApi
            .get('api/reef/workspaces/me', {
              headers: {
                Authorization: `Bearer ${data.access_token}`
              }
            })
            .json()) as WorkspaceResponse[];

          userData.access_token = data.access_token;
          userData.select_workspace_id = userWorkspaces.find(
            (workspace) => workspace.owner_user_id === userData.id
          )?.id;
          console.log('userData', userData);
          return userData;
        } catch (error) {
          console.error('Login error:', error);
          throw new Error(
            error instanceof Error ? error.message : 'Login failed'
          );
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, trigger, session, user }) {
      // 当 session 更新时，更新 token 中的 select_workspace_id
      if (trigger === 'update') {
        token.select_workspace_id = session.user.select_workspace_id;
        return token;
      }
      if (user) {
        token.accessToken = user.access_token;
        token.id = user.id;
        token.select_workspace_id = user.select_workspace_id;
        token.is_superuser = user.is_superuser;
        token.is_active = user.is_active;
        token.is_verified = user.is_verified;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.select_workspace_id = token.select_workspace_id as string;
      session.user.is_superuser = token.is_superuser as boolean;
      session.user.is_active = token.is_active as boolean;
      session.user.is_verified = token.is_verified as boolean;
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    signOut: '/signin'
  },
  session: {
    strategy: 'jwt',
    maxAge: 35000
  },
  trustHost: true
} satisfies NextAuthConfig;

export default authConfig;
