import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';

/** 관리자 화면 틀. 헤더는 손님 화면과 같은 것을 쓰고, 화면 이동은 헤더의 관리자 메뉴로 한다. */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <SiteHeader wide />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
