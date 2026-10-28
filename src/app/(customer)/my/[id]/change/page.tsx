import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Loading } from '@/components/ui/states';
import { RequireRole } from '@/features/auth/RequireRole';
import { ChangeReservation } from '@/features/my-reservations/ChangeReservation';

export const metadata: Metadata = { title: '예약 변경' };

export default function ChangePage() {
  return (
    <PageContainer>
      <Suspense fallback={<Loading />}>
        <RequireRole role="customer">
          <ChangeReservation />
        </RequireRole>
      </Suspense>
    </PageContainer>
  );
}
