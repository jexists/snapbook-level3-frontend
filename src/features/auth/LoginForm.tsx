'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/inputs';
import { useFormErrors } from '@/hooks/use-form-errors';
import { api } from '@/lib/api';
import type { LoginResult } from '@/types/api';
import { useAuth } from './AuthProvider';

/** 로그인 후 돌아갈 곳. 바깥 주소로는 보내지 않는다. */
export function useNextPath(fallback: string) {
  const next = useSearchParams().get('next');
  return next?.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

/** 손님과 관리자가 같이 쓰는 로그인. 관리자면 관리자 화면으로 보낸다. */
export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const nextPath = useNextPath('/');
  const errors = useFormErrors();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    errors.clear();
    setSubmitting(true);
    try {
      const result = await api<LoginResult>('/auth/login', { method: 'POST', body: { loginId, password } });
      signIn(result);
      if (result.user.role === 'admin') router.replace(nextPath.startsWith('/admin') ? nextPath : '/admin');
      else router.replace(nextPath.startsWith('/admin') ? '/' : nextPath);
    } catch (error) {
      errors.fromError(error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FormField label="아이디" error={errors.fieldErrors.loginId}>
        {(field) => (
          <Input
            id={field.id}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid}
            autoComplete="username"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
          />
        )}
      </FormField>
      <FormField label="비밀번호" error={errors.fieldErrors.password}>
        {(field) => (
          <Input
            id={field.id}
            type="password"
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </FormField>
      <Button type="submit" loading={submitting} className="mt-8">
        로그인
      </Button>
      <p className="text-center text-small text-ink-soft">
        계정이 없으신가요?{' '}
        <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="inline-flex min-h-11 items-center font-medium text-accent hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
