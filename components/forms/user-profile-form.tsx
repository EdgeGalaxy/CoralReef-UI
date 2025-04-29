'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/constants/user';
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { PencilIcon, BadgeCheck, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(1, { message: '用户名不能为空' }),
  phone: z.string().optional()
});

type UserProfileFormValues = z.infer<typeof formSchema>;

// 验证表单模式
enum VerificationMode {
  EMAIL = 'email',
  PHONE = 'phone'
}

// 验证表单结构
const verificationSchema = z.object({
  value: z.string().min(1, { message: '不能为空' }),
  code: z
    .string()
    .min(4, { message: '验证码至少4位' })
    .max(6, { message: '验证码最多6位' })
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface UserProfileFormProps {
  user: UserProfile;
  onUpdateSuccess?: () => void;
}

export default function UserProfileForm({
  user,
  onUpdateSuccess
}: UserProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const authApi = useAuthApi();

  // 验证相关状态
  const [verificationMode, setVerificationMode] =
    useState<VerificationMode | null>(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username || '',
      phone: user.phone || ''
    }
  });

  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      value: '',
      code: ''
    }
  });

  // 开始修改邮箱或手机号
  const handleStartVerification = (mode: VerificationMode) => {
    setVerificationMode(mode);
    setIsVerificationOpen(true);
    setCodeSent(false);
    setCodeCountdown(0);

    // 设置默认值
    if (mode === VerificationMode.EMAIL) {
      verificationForm.setValue('value', user.email || '');
    } else {
      verificationForm.setValue('value', user.phone || '');
    }
  };

  // 发送验证码
  const handleSendCode = () => {
    const value = verificationForm.getValues('value');

    if (!value) {
      toast({
        title: '发送失败',
        description:
          verificationMode === VerificationMode.EMAIL
            ? '请输入邮箱'
            : '请输入手机号',
        variant: 'destructive'
      });
      return;
    }

    // 模拟发送验证码
    setCodeSent(true);
    setCodeCountdown(60);

    // 倒计时
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast({
      title: '验证码已发送',
      description: `验证码已发送至${
        verificationMode === VerificationMode.EMAIL ? '邮箱' : '手机'
      }，请注意查收`
    });
  };

  // 验证并更新
  const handleVerify = async (values: VerificationFormValues) => {
    try {
      setIsLoading(true);

      // 模拟后端验证
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 根据模式更新字段
      const fieldToUpdate =
        verificationMode === VerificationMode.EMAIL ? 'email' : 'phone';

      await handleApiRequest(
        () =>
          authApi.patch(`auth/users/me`, {
            json: {
              [fieldToUpdate]: values.value
            }
          }),
        {
          toast,
          successTitle: `${
            verificationMode === VerificationMode.EMAIL ? '邮箱' : '手机号'
          }已更新`,
          errorTitle: '更新失败',
          onSuccess: () => {
            setIsVerificationOpen(false);
            verificationForm.reset();
            if (onUpdateSuccess) {
              onUpdateSuccess();
            }
          }
        }
      );
    } catch (error: any) {
      toast({
        title: '验证失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: UserProfileFormValues) => {
    try {
      setIsLoading(true);

      await handleApiRequest(
        () => authApi.patch(`auth/users/me`, { json: values }),
        {
          toast,
          successTitle: '个人资料已更新',
          errorTitle: '更新失败',
          onSuccess: () => {
            if (onUpdateSuccess) {
              onUpdateSuccess();
            }
          }
        }
      );
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 用户名字段 */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="用户名" {...field} />
                  </FormControl>
                  <FormDescription>您的公开显示名称</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 邮箱字段（只读） */}
            <div className="space-y-2">
              <FormLabel>邮箱</FormLabel>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Input value={user.email || ''} disabled className="pr-10" />
                  <button
                    type="button"
                    onClick={() =>
                      handleStartVerification(VerificationMode.EMAIL)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
                {user.is_verified ? (
                  <BadgeCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <FormDescription>
                {user.is_verified
                  ? '已验证的邮箱地址'
                  : '邮箱未验证，建议尽快验证'}
              </FormDescription>
            </div>

            {/* 手机号字段（只读） */}
            <div className="space-y-2">
              <FormLabel>手机号码</FormLabel>
              <div className="flex items-center">
                <div className="relative w-full">
                  <Input
                    value={user.phone || '未设置'}
                    disabled
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleStartVerification(VerificationMode.PHONE)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <FormDescription>用于账户安全和通知（选填）</FormDescription>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存更改'}
            </Button>
          </div>
        </form>
      </Form>

      {/* 验证弹窗 */}
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              修改
              {verificationMode === VerificationMode.EMAIL ? '邮箱' : '手机号'}
            </DialogTitle>
            <DialogDescription>
              请输入新的
              {verificationMode === VerificationMode.EMAIL ? '邮箱' : '手机号'}
              并验证
            </DialogDescription>
          </DialogHeader>
          <Form {...verificationForm}>
            <form
              onSubmit={verificationForm.handleSubmit(handleVerify)}
              className="space-y-4"
            >
              <FormField
                control={verificationForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {verificationMode === VerificationMode.EMAIL
                        ? '新邮箱'
                        : '新手机号'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          verificationMode === VerificationMode.EMAIL
                            ? '输入新邮箱'
                            : '输入新手机号'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>验证码</FormLabel>
                        <FormControl>
                          <Input placeholder="输入验证码" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="mb-[2px] w-full"
                    onClick={handleSendCode}
                    disabled={codeCountdown > 0}
                  >
                    {codeCountdown > 0 ? `${codeCountdown}秒` : '发送验证码'}
                  </Button>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVerificationOpen(false)}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isLoading || !codeSent}>
                  {isLoading ? '验证中...' : '验证并更新'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
