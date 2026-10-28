import type { Metadata } from 'next';
import { PageTitle } from '@/components/layout/PageTitle';
import { ReservationSearch } from '@/features/admin/ReservationSearch';

// 로그인 확인 뒤에 그려지는 화면이라 즉시 이동 검사에서 뺀다 (layout.tsx 참고)
export const instant = false;

export const metadata: Metadata = { title: '예약 검색' };

export default function AdminReservationsPage() {
  return (
    <>
      <PageTitle title="예약 검색" />
      <ReservationSearch />
    </>
  );
}
