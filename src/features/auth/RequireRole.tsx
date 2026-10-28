'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loading } from '@/components/ui/states';
import type { Role } from '@/types/api';
import { useAuth } from './AuthProvider';

/** 역할이 맞지 않으면 로그인 화면으로 보낸다. 진짜 권한 확인은 백엔드가 한다. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, ready, signedOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = user?.role === role;

  useEffect(() => {
    // 로그아웃한 직후라면 AuthProvider가 첫 화면으로 보내는 중이라 로그인 화면으로 돌리지 않는다
    if (ready && !allowed && !signedOut) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, allowed, signedOut, pathname, router]);

  if (!ready || !allowed) return <Loading label="로그인 정보를 확인하고 있어요" />;
  return children;
}
