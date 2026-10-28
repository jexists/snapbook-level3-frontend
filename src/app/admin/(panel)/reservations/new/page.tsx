import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageTitle } from '@/components/layout/PageTitle';
import { Loading } from '@/components/ui/states';
import { AdminReservationForm } from '@/features/admin/AdminReservationForm';

// 로그인 확인 뒤에 그려지는 화면이라 즉시 이동 검사에서 뺀다 (layout.tsx 참고)
export const instant = false;

export const metadata: Metadata = { title: '예약 추가' };

export default function NewReservationPage() {
  return (
    <>
      <PageTitle title="예약 추가" />
      <Suspense fallback={<Loading />}>
        <AdminReservationForm />
      </Suspense>
    </>
  );
}
