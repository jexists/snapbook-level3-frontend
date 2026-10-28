import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Loading } from '@/components/ui/states';
import { LoginForm } from '@/features/auth/LoginForm';
import { AuthCard } from '@/features/auth/AuthCard';

export const metadata: Metadata = { title: '로그인' };

export default function LoginPage() {
  return (
    <PageContainer>
    <AuthCard title="로그인">
      <Suspense fallback={<Loading />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
    </PageContainer>
  );
}
