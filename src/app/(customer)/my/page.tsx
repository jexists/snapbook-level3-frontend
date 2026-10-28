import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTitle } from '@/components/layout/PageTitle';
import { RequireRole } from '@/features/auth/RequireRole';
import { MyReservations } from '@/features/my-reservations/MyReservations';

export const metadata: Metadata = { title: '예약 확인' };

export default function MyPage() {
  return (
    <PageContainer>
      <PageTitle title="예약 확인" />
      <RequireRole role="customer">
        <MyReservations />
      </RequireRole>
    </PageContainer>
  );
}
