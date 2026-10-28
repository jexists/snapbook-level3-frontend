import type { ReactNode } from 'react';

/** 로그인·가입 화면의 틀. 제목만으로 충분하면 description은 넘기지 않는다. */
export function AuthCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[440px]">
      <h1 className="text-title font-semibold tracking-[-0.02em]">{title}</h1>
      {description && <p className="mt-2 text-small text-ink-soft">{description}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
