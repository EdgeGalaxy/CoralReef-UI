import * as z from 'zod';

export const UserRegisterSchema = z
  .object({
    username: z.string().min(1, {
      message: '用户名不能为空'
    }),
    email: z.string().email({
      message: '请输入有效的邮箱地址'
    }),
    password: z.string().min(6, {
      message: '密码至少需要6个字符'
    }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密码不匹配',
    path: ['confirmPassword']
  });
