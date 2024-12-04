import UserAuthForm from '@/components/forms/user-auth-form';
import AuthLayout from '@/components/layout/auth-layout';

export default function AuthenticationPage() {
  return (
    <AuthLayout title="登录" buttonText="注册账号" buttonHref="/signup">
      <UserAuthForm />
    </AuthLayout>
  );
}
