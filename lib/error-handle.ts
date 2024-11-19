import { toast } from '@/components/ui/use-toast';

interface ErrorHandlerOptions {
  toast: typeof toast;
  successTitle?: string;
  errorTitle?: string;
  onSuccess?: () => void;
}

export async function handleApiRequest<T>(
  apiCall: () => Promise<Response>,
  options: ErrorHandlerOptions
): Promise<T | null> {
  try {
    const res = await apiCall();
    if (!res.ok) throw new Error('API request failed');

    if (options.successTitle) {
      options.toast({
        title: options.successTitle
      });
    }

    options.onSuccess?.();
    return res.json();
  } catch (error: any) {
    const errorTitle = options.errorTitle ?? '操作失败';

    if (error.name === 'HTTPError') {
      const res = await error.response.json();
      options.toast({
        variant: 'destructive',
        title: errorTitle,
        description: res.message
      });
    } else {
      options.toast({
        variant: 'destructive',
        title: errorTitle,
        description: error instanceof Error ? error.message : '请稍后重试'
      });
    }
    return null;
  }
}
