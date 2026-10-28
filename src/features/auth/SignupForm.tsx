'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/inputs';
import { useFormErrors } from '@/hooks/use-form-errors';
import { api } from '@/lib/api';
import type { LoginResult } from '@/types/api';
import { useAuth } from './AuthProvider';
import { useNextPath } from './LoginForm';

const FIELDS = [
  { name: 'name', label: '이름', autoComplete: 'name', type: 'text', placeholder: '이름을 입력해 주세요' },
  { name: 'phone', label: '휴대폰 번호', autoComplete: 'tel', type: 'tel', placeholder: '숫자만 11자리 (예: 01012345678)' },
  { name: 'loginId', label: '아이디', autoComplete: 'username', type: 'text', placeholder: '영문, 숫자 4~20자' },
  { name: 'password', label: '비밀번호', autoComplete: 'new-password', type: 'password', placeholder: '8자 이상' },
] as const;

type FieldName = (typeof FIELDS)[number]['name'];

export function SignupForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const nextPath = useNextPath('/');
  const errors = useFormErrors();
  const [values, setValues] = useState<Record<FieldName, string>>({ name: '', phone: '', loginId: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    errors.clear();
    setSubmitting(true);
    try {
      signIn(await api<LoginResult>('/auth/signup', { method: 'POST', body: values }));
      router.replace(nextPath);
    } catch (error) {
      errors.fromError(error);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {FIELDS.map((item) => (
        <FormField key={item.name} label={item.label} error={errors.fieldErrors[item.name]}>
          {(field) => (
            <Input
              id={field.id}
              type={item.type}
              inputMode={item.name === 'phone' ? 'numeric' : undefined}
              aria-describedby={field.describedBy}
              aria-invalid={field.invalid}
              autoComplete={item.autoComplete}
              placeholder={item.placeholder}
              value={values[item.name]}
              onChange={(event) => {
                setValues((current) => ({ ...current, [item.name]: event.target.value }));
                errors.clearField(item.name);
              }}
            />
          )}
        </FormField>
      ))}
      <Button type="submit" loading={submitting} className="mt-8">
        가입하기
      </Button>
      <p className="text-center text-small text-ink-soft">
        이미 계정이 있으신가요?{' '}
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="inline-flex min-h-11 items-center font-medium text-accent hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
