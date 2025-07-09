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

// 处理401错误的统一函数
export const handle401Error = () => {
  if (typeof window !== 'undefined') {
    // 清除本地存储
    localStorage.clear();
    // 跳转到登录页面
    window.location.href = '/signin';
  }
};

// 带有401错误处理的fetch包装函数
export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, init);

  // 检查401响应状态
  if (response.status === 401) {
    handle401Error();
    throw new Error('Unauthorized');
  }

  return response;
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
      ],
      afterResponse: [
        (_request, _options, response) => {
          // 检查401响应状态
          if (response.status === 401) {
            handle401Error();
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
  const response = await fetchWithAuth(fullUrl, {
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
