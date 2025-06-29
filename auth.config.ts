import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import { noAuthApi } from '@/lib/utils';
import type { GitHubProfile } from 'next-auth/providers/github';
import {
  UserRead,
  PaginationResponse,
  WorkspaceDetail,
  UserCreate
} from '@/constants/user';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

declare module 'next-auth' {
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    access_token: string;
    token: string;
    username: string;
    select_workspace_id?: string;
    is_superuser: boolean;
    is_active: boolean;
    is_verified: boolean;
    isOAuthLogin?: boolean;
    oauth_account_id?: string;
  }

  interface Session {
    accessToken?: string;
    user: User;
    isOAuthLogin?: boolean;
    oauth_account_id?: string;
  }
}

const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      authorization: {
        params: {
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
        }
      },
      profile(profile: GitHubProfile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          token: '',
          access_token: '',
          select_workspace_id: undefined,
          is_superuser: false,
          is_active: true,
          is_verified: true,
          isOAuthLogin: true
        };
      }
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
            return null;
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
            .json()) as PaginationResponse<WorkspaceDetail>;

          return {
            id: userData.id,
            name: userData.username,
            email: userData.email,
            username: userData.username,
            token: data.access_token,
            access_token: data.access_token,
            select_workspace_id: userWorkspaces.items.find(
              (workspace) => workspace.owner_user_id === userData.id
            )?.id,
            is_superuser: userData.is_superuser,
            is_active: userData.is_active,
            is_verified: userData.is_verified
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, trigger, session, user, account }) {
      if (account?.provider) {
        token.isOAuthLogin = true;
        token.oauth_account_id = account.providerAccountId;
      }

      // 当 session 更新时，更新 token 中的数据
      if (trigger === 'update') {
        token.select_workspace_id = session.user.select_workspace_id;
        token.isOAuthLogin = session.isOAuthLogin;
        token.oauth_account_id = session.oauth_account_id;
        return token;
      }

      if (user) {
        token.accessToken = user.access_token;
        if (user.id) token.id = user.id;
        token.select_workspace_id = user.select_workspace_id;
        token.is_superuser = user.is_superuser;
        token.is_active = user.is_active;
        token.is_verified = user.is_verified;
        token.isOAuthLogin = user.isOAuthLogin;
        token.oauth_account_id = user.oauth_account_id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      session.user.select_workspace_id =
        session.user.select_workspace_id ||
        (token.select_workspace_id as string | undefined);
      session.user.is_superuser = token.is_superuser as boolean;
      session.user.is_active = token.is_active as boolean;
      session.user.is_verified = token.is_verified as boolean;
      session.isOAuthLogin = token.isOAuthLogin as boolean;
      session.oauth_account_id = token.oauth_account_id as string | undefined;
      return session;
    },
    async signIn({ user, account, profile }) {
      // 如果是GitHub登录，需要调用后端接口
      if (account?.provider === 'github' && account.access_token) {
        try {
          const response = await noAuthApi.post<LoginResponse>(
            `auth/users/oauth/${account.provider}/callback/${account.providerAccountId}`,
            {
              json: {
                username: profile?.name,
                email: profile?.email
              }
            }
          );

          if (response.ok) {
            const data = (await response.json()) as LoginResponse;
            // 更新用户信息
            if (data.access_token) {
              user.access_token = data.access_token;
              user.token = data.access_token;

              // 获取用户详细信息
              try {
                const userData = (await noAuthApi
                  .get('auth/users/me', {
                    headers: { Authorization: `Bearer ${data.access_token}` }
                  })
                  .json()) as UserRead;

                // 获取工作空间
                const workspacesData = (await noAuthApi
                  .get('api/reef/workspaces/me', {
                    headers: { Authorization: `Bearer ${data.access_token}` }
                  })
                  .json()) as PaginationResponse<WorkspaceDetail>;

                // 更新用户信息
                user.id = userData.id;
                user.email = userData.email;
                user.name = userData.username;
                user.username = userData.username;
                user.is_superuser = userData.is_superuser;
                user.is_active = userData.is_active;
                user.is_verified = userData.is_verified;
                user.oauth_account_id = account.providerAccountId;

                // 设置select_workspace_id
                const defaultWorkspace = workspacesData.items.find(
                  (workspace) => workspace.owner_user_id === userData.id
                );

                if (defaultWorkspace) {
                  user.select_workspace_id = defaultWorkspace.id;
                }
              } catch (error) {
                console.error('获取用户详细信息失败:', error);
              }
            }
          }
        } catch (error) {
          console.error('GitHub OAuth处理失败:', error);
          // 即使出错也允许登录，随后可以显示完善信息表单
        }
      }
      return true;
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
