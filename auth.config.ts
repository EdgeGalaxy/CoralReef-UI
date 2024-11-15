import { NextAuthConfig } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import { noAuthApi } from '@/lib/utils';
import { UserRead } from '@/constants/user';

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
      clientSecret: process.env.GITHUB_SECRET ?? '',
      httpOptions: {
        timeout: 10000
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

          userData.access_token = data.access_token;

          return userData;
        } catch (error) {
          console.error('Login error:', error);
          // 登陆失败，弹框提示
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
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
  }
} satisfies NextAuthConfig;

export default authConfig;
