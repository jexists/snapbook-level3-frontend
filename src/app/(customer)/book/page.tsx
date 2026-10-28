import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageTitle } from '@/components/layout/PageTitle';
import { ButtonLink } from '@/components/ui/Button';
import { Loading, RetryState } from '@/components/ui/states';
import { ToastOnMount } from '@/components/ui/ToastOnMount';
import { RequireRole } from '@/features/auth/RequireRole';
import { BookingWizard } from '@/features/booking/BookingWizard';
import { api } from '@/lib/api';
import type { ShootType } from '@/types/api';

export const metadata: Metadata = { title: '예약하기' };

export default function BookPage() {
  return (
    <PageContainer>
      <PageTitle title="예약하기" />
      <Suspense fallback={<Loading />}>
        <BookingLoader />
      </Suspense>
    </PageContainer>
  );
}

/** 촬영 종류는 공개 데이터라 서버에서 가져와 예약 단계에 넘긴다 */
async function BookingLoader() {
  let shootTypes: ShootType[];
  try {
    shootTypes = await api<ShootType[]>('/shoot-types');
  } catch {
    return (
      <>
        <ToastOnMount message="촬영 종류를 불러오지 못했어요. 잠시 뒤 새로고침해 주세요." />
        <RetryState action={<ButtonLink href="/book" variant="secondary">새로고침</ButtonLink>} />
      </>
    );
  }
  return (
    <RequireRole role="customer">
      <BookingWizard shootTypes={shootTypes} />
    </RequireRole>
  );
}
