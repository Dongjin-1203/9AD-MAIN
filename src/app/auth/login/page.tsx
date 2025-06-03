// src/app/auth/login/page.tsx
import { getCurrentSoldierFromToken } from '@/app/actions/auth';
import LoginClientPage from '@/app/auth/login/loginClientPage';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getCurrentSoldierFromToken();
  if (user) {
    redirect('/'); // 이미 로그인된 경우 홈으로 리디렉션
  }

  return <LoginClientPage />;
}
