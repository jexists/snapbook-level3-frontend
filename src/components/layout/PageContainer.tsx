import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** 예약·로그인 같은 업무 화면의 본문 폭과 여백 (첫 화면은 자기 폭을 쓴다) */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[720px] px-5 pb-20 pt-8 sm:pt-12', className)}>{children}</div>;
}
