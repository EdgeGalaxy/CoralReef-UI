'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { noAuthApi } from '@/lib/utils';
import { UserRegisterSchema } from '@/lib/form-schema';

export default function UserRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof UserRegisterSchema>>({
    resolver: zodResolver(UserRegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(values: z.infer<typeof UserRegisterSchema>) {
    try {
      const formData = new URLSearchParams({
        username: values.username,
        email: values.email,
        password: values.password
      });

      console.log(Object.fromEntries(formData.entries()));

      const response = await noAuthApi.post('auth/register', {
        json: Object.fromEntries(formData.entries())
      });

      if (response.ok) {
        router.push('/signin');
      } else {
        toast({
          title: '注册失败',
          description: '请检查邮箱和密码是否正确',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '注册失败',
        description: `请检查网络连接是否正常: ${error}`,
        variant: 'destructive'
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="用户名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          注册
        </Button>
      </form>
    </Form>
  );
}
