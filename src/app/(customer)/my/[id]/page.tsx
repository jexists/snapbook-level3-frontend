import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Loading } from '@/components/ui/states';
import { RequireRole } from '@/features/auth/RequireRole';
import { ReservationDetail } from '@/features/my-reservations/ReservationDetail';

export const metadata: Metadata = { title: '예약 상세' };

export default function ReservationPage() {
  return (
    <PageContainer>
      <Suspense fallback={<Loading />}>
        <RequireRole role="customer">
          <ReservationDetail />
        </RequireRole>
      </Suspense>
    </PageContainer>
  );
}
