import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata = {
  title: 'Đăng nhập | TaskFlow',
  description: 'Đăng nhập vào tài khoản TaskFlow của bạn',
};

export default function LoginPage() {
  return <LoginForm />;
}
