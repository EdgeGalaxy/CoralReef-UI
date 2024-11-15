import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ky from 'ky';
import { useSession } from 'next-auth/react';
import { getApiUrl } from './api-config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 从本地存储中获取 workspace Id
export const getSelectWorkspaceId: () => string = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedWorkspaceId') || '';
  }
  return '';
};

// 从本地存储中设置 workspace Id
export const setSelectWorkspaceId = (workspaceId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedWorkspaceId', workspaceId);
  }
};

// 从本地存储中获取 JWT token
export const getToken = (): string => {
  if (typeof window !== 'undefined') {
    // const { data: session } = useSession();
    // return session?.accessToken || '';
    return localStorage.getItem('jwt_token') || '';
  }
  return '';
};

export const noAuthApi = ky.create({
  prefixUrl: getApiUrl(''),
  headers: {
    'Content-Type': 'application/json'
  }
});

export function createApi(token: string) {
  return ky.create({
    prefixUrl: getApiUrl(''),
    hooks: {
      beforeRequest: [
        (request) => {
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }
      ]
    },
    retry: 0,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export const fetcher = async <T>(url: string, token: string): Promise<T> => {
  const fullUrl = getApiUrl(url);
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('An error occurred while fetching the data.');
  }

  return response.json();
};
