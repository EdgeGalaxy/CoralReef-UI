import UserRegisterForm from '@/components/forms/user-register-form';
import AuthLayout from '@/components/layout/auth-layout';

export default function RegisterPage() {
  return (
    <AuthLayout title="创建账号" buttonText="返回登录" buttonHref="/signin">
      <UserRegisterForm />
    </AuthLayout>
  );
}
