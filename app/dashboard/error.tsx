'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 可以在这里添加错误日志上报逻辑
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6">
      <Alert variant="destructive" className="mb-4 max-w-[600px]">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>发生错误</AlertTitle>
        <AlertDescription>
          {error.message || '加载页面时出现了一些问题，请稍后重试。'}
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => (window.location.href = '/dashboard')}
        >
          返回首页
        </Button>
        <Button onClick={() => reset()}>重试</Button>
      </div>
    </div>
  );
}
