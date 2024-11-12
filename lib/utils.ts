import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ky from 'ky';
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
    return localStorage.getItem('jwt_token') || '';
  }
  return '';
};

// Token 设置函数
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
};

// Token 清除函数
export const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
};

export const api = ky.create({
  prefixUrl: getApiUrl(''),
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getToken();
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

export const fetcher = async (url: string) => {
  const fullUrl = getApiUrl(url);
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    }
  });

  console.log(response);

  if (!response.ok) {
    throw new Error('An error occurred while fetching the data.');
  }

  return response.json();
};
