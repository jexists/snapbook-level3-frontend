import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Loading } from '@/components/ui/states';
import { AuthCard } from '@/features/auth/AuthCard';
import { SignupForm } from '@/features/auth/SignupForm';

export const metadata: Metadata = { title: '회원가입' };

export default function SignupPage() {
  return (
    <PageContainer>
    <AuthCard title="회원가입">
      <Suspense fallback={<Loading />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
    </PageContainer>
  );
}
