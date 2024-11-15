'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { Icons } from './icons';

export default function GithubSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl');

  return (
    <Button
      className="w-full"
      variant="outline"
      type="button"
      onClick={() =>
        signIn('github', { callbackUrl: callbackUrl ?? '/dashboard' })
      }
    >
      <Icons.gitHub className="mr-2 h-4 w-4" />
      使用 Github 登录
    </Button>
  );
}
