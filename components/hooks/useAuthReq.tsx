'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher, createApi, noAuthApi } from '@/lib/utils';

export function useAuthSWR<T>(url: string | null) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useSWR(token ? [url, token] : null, ([url, token]) =>
    fetcher<T>(url, token)
  );
}

export function useAuthApi() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const api = useMemo(() => createApi(token as string), [token]);

  return api;
}

export function useNoAuthApi() {
  return noAuthApi;
}
