'use client';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
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
import { useAuthApi } from '@/components/hooks/useAuthReq';
import { handleApiRequest } from '@/lib/error-handle';

// 验证表单模式
enum VerificationMode {
  NONE = 'none',
  PHONE = 'phone'
}

// 表单结构
const profileSchema = z
  .object({
    password: z.string().min(6, { message: '密码必须至少6个字符' }),
    confirmPassword: z.string().min(6, { message: '确认密码必须至少6个字符' }),
    usePhone: z.boolean().default(false),
    phone: z.string().optional(),
    code: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不匹配',
    path: ['confirmPassword']
  })
  .refine(
    (data) => {
      // 如果选择了使用手机，则手机号必须填写
      return !data.usePhone || (data.phone && data.phone.length > 0);
    },
    {
      message: '请输入手机号',
      path: ['phone']
    }
  )
  .refine(
    (data) => {
      // 如果选择了使用手机，则验证码必须填写
      return !data.usePhone || (data.code && data.code.length > 0);
    },
    {
      message: '请输入验证码',
      path: ['code']
    }
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function OAuthCompleteProfileModal() {
  const { data: session, update: updateSession, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const authApi = useAuthApi();

  // 验证码相关状态
  const [verificationMode, setVerificationMode] = useState<VerificationMode>(
    VerificationMode.NONE
  );
  const [codeSent, setCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      usePhone: false,
      phone: '',
      code: ''
    }
  });

  // 切换是否使用手机验证
  const toggleUsePhone = (value: boolean) => {
    form.setValue('usePhone', value);
    setVerificationMode(value ? VerificationMode.PHONE : VerificationMode.NONE);

    if (!value) {
      form.setValue('phone', '');
      form.setValue('code', '');
      setCodeSent(false);
    }
  };

  // 发送验证码
  const handleSendCode = () => {
    const phone = form.getValues('phone');

    if (!phone) {
      toast({
        title: '发送失败',
        description: '请输入手机号',
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
      description: '验证码已发送至手机，请注意查收'
    });
  };

  // 检查是否是 OAuth 登录
  useEffect(() => {
    if (status === 'authenticated' && session?.isOAuthLogin) {
      setIsOpen(true);
    }
  }, [status, session]);

  // 表单提交
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsLoading(true);

      // 创建要发送的数据
      const updateData: Record<string, any> = {
        password: values.password
      };

      // 如果使用手机，添加手机号
      if (values.usePhone && values.phone) {
        updateData.phone = values.phone;
      }

      // 更新用户信息
      await handleApiRequest(
        () =>
          authApi.patch(`auth/users/me`, {
            json: updateData
          }),
        {
          toast,
          successTitle: '个人资料已更新',
          errorTitle: '更新失败',
          onSuccess: () => {
            // 关闭弹窗
            setIsOpen(false);

            // 更新session中的isOAuthLogin标志
            updateSession({
              ...session,
              isOAuthLogin: false
            });

            // 跳转到首页
            router.push('/dashboard');
          }
        }
      );
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 无法关闭弹窗，必须完成配置
  const preventClose = useCallback((e: any) => {
    e.preventDefault();
  }, []);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open === false) {
          // 阻止关闭
          setIsOpen(true);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[500px]"
        style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
        onPointerDownOutside={preventClose}
        onEscapeKeyDown={preventClose}
      >
        <DialogHeader>
          <DialogTitle>完善账户信息</DialogTitle>
          <DialogDescription>
            您已使用GitHub成功登录，请设置密码以完成账户设置
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="设置账户密码"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="再次输入密码"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="usePhone"
                checked={form.getValues('usePhone')}
                onChange={(e) => toggleUsePhone(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="usePhone"
                className="text-sm font-medium text-gray-700"
              >
                添加手机号（选填）
              </label>
            </div>

            {form.getValues('usePhone') && (
              <>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号码</FormLabel>
                      <FormControl>
                        <Input placeholder="输入手机号码" {...field} />
                      </FormControl>
                      <FormDescription>用于账户安全和通知</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
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
              </>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="submit"
                disabled={
                  isLoading || (form.getValues('usePhone') && !codeSent)
                }
                className="w-full"
              >
                {isLoading ? '保存中...' : '完成设置'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
