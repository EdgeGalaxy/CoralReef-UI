import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  buttonText: string;
  buttonHref: string;
}

export default function AuthLayout({
  children,
  title,
  buttonText,
  buttonHref
}: AuthLayoutProps) {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Logo
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">完善的设备管理、算法部署工具平台</p>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <Link
                href={buttonHref}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'px-4 py-2'
                )}
              >
                {buttonText}
              </Link>
            </div>
          </div>
          {children}
          <p className="px-8 text-center text-sm text-muted-foreground">
            点击{title.slice(0, 2)}，即表示你同意我们的{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              服务条款
            </Link>{' '}
            和{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              隐私政策
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
