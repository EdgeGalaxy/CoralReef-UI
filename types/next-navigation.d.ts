declare module 'next/navigation' {
  import type { ReadonlyURLSearchParams } from 'next/navigation';

  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
  };

  export function useParams<T extends Record<string, string> = Record<string, string>>(): T;
  export function useSearchParams(): ReadonlyURLSearchParams;
}