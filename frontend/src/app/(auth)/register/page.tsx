import { RegisterForm } from '@/features/auth/components/RegisterForm';

export const metadata = {
  title: 'Đăng ký | TaskFlow',
  description: 'Tạo tài khoản TaskFlow mới',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
