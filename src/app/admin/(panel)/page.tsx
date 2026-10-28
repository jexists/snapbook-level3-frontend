import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loading } from '@/components/ui/states';
import { AdminSchedule } from '@/features/admin/AdminSchedule';

// 로그인 확인 뒤에 그려지는 화면이라 즉시 이동 검사에서 뺀다 (layout.tsx 참고)
export const instant = false;

export const metadata: Metadata = { title: '일정' };

export default function AdminHomePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminSchedule />
    </Suspense>
  );
}
