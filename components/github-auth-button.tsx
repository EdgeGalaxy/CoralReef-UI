'use client';

import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

const GithubSignInButton: FC = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await signIn('github', {
        callbackUrl: callbackUrl ?? '/dashboard',
        redirect: true
      });
    } catch (error) {
      console.error('GitHub 登录失败:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full border-input"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Github className="mr-2 h-4 w-4" />
      )}
      GitHub 登录
    </Button>
  );
};

export default GithubSignInButton;
