'use client';

import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

const GithubSignInButton: FC = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl');

  const handleClick = async () => {
    try {
      await signIn('github', {
        callbackUrl: callbackUrl ?? '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('GitHub 登录失败:', error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full border-input"
    >
      <Github className="mr-2 h-4 w-4" />
      GitHub 登录
    </Button>
  );
};

export default GithubSignInButton;
